<?php
require_once __DIR__ . '/db.php';
sendHeaders();
handleOptions();

// Production: disable direct error display
ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    sendHeaders();
    handleOptions();
    $input = getJsonInput();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {
        if (
            empty($input['userId']) || empty($input['regionId']) || !isset($input['dates']) || count($input['dates']) < 3 ||
            count($input['dates']) > 4
        )
            throw new Exception("Invalid Vote");
        $userId = (int) $input['userId'];
        $regionId = $input['regionId']; // countyId
        $dates = $input['dates'];
        $packageId = isset($input['packageId']) ? $input['packageId'] : null;

        $res = processDB(function (&$db) use ($userId, $regionId, $dates, $packageId) {
            if (!isset($db['vote_blocks']))
                $db['vote_blocks'] = [];

            sort($dates);
            // Idempotency: Check if exactly the same vote exists
            foreach ($db['vote_blocks'] as &$b) {
                if ((isset($b['user_id']) ? $b['user_id'] : 0) === $userId && (isset($b['region_id']) ? $b['region_id'] : '') === $regionId) {
                    $bd = isset($b['dates']) ? $b['dates'] : [];
                    sort($bd);
                    $bp = isset($b['package_id']) ? $b['package_id'] : null;
                    if ($bd == $dates && $bp == $packageId) {
                        $b['created_at'] = date('Y-m-d H:i:s'); // Update timestamp
                        return $b;
                    }
                }
            }

            $new = [
                "id" => getNextId($db['vote_blocks']),
                "user_id" => $userId,
                "region_id" => $regionId,
                "package_id" => $packageId,
                "dates" => $dates,
                "created_at" => date('Y-m-d H:i:s')
            ];
            $db['vote_blocks'][] = $new;
            return $new;
        });

        echo json_encode(["success" => true, "block" => $res]);

    } elseif ($method === 'DELETE') {
        if (empty($input['userId']) || empty($input['blockId']))
            throw new Exception("Invalid Delete");
        $userId = (int) $input['userId'];
        $blockId = (int) $input['blockId'];

        processDB(function (&$db) use ($userId, $blockId) {
            if (!isset($db['vote_blocks']))
                return;

            // Find the block to know which dates to cleanup
            $datesToRemove = [];
            $regionToClean = null;

            foreach ($db['vote_blocks'] as $b) {
                if ((isset($b['id']) ? $b['id'] : 0) === $blockId && (isset($b['user_id']) ? $b['user_id'] : 0) === $userId) {
                    $datesToRemove = isset($b['dates']) ? $b['dates'] : [];
                    $regionToClean = isset($b['region_id']) ? $b['region_id'] : null;
                    break;
                }
            }

            // Remove the block
            $db['vote_blocks'] = array_values(array_filter($db['vote_blocks'], function ($b) use ($blockId) {
                return (isset($b['id']) ? $b['id'] : 0) !== $blockId;
            }));

            // Cleanup associated individual date selections
            if ($regionToClean && !empty($datesToRemove) && isset($db['date_selections'])) {
                $db['date_selections'] = array_values(array_filter($db['date_selections'], function ($ds) use ($userId, $regionToClean, $datesToRemove) {
                    $uOk = (isset($ds['user_id']) ? $ds['user_id'] : 0) === $userId;
                    $rOk = (isset($ds['region_id']) ? $ds['region_id'] : '') === $regionToClean;
                    $dOk = in_array(isset($ds['date']) ? $ds['date'] : '', $datesToRemove);
                    return !($uOk && $rOk && $dOk);
                }));
            }

            return true;
        });
        echo json_encode(["success" => true]);

    } elseif ($method === 'GET') {
        $userId = isset($_GET['userId']) ? (int) $_GET['userId'] : null;
        $db = readDB();
        $ret = [];
        if (!empty($db['vote_blocks'])) {
            foreach ($db['vote_blocks'] as $v) {
                if (!$userId || (isset($v['user_id']) ? $v['user_id'] : 0) === $userId) {
                    $ret[] = [
                        "id" => $v['id'],
                        "userId" => $v['user_id'],
                        "regionId" => $v['region_id'],
                        "packageId" => isset($v['package_id']) ? $v['package_id'] : null,
                        "dates" => $v['dates'],
                        "createdAt" => $v['created_at']
                    ];
                }
            }
        }
        echo json_encode($ret);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
