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
        if (empty($input['userId']) || !isset($input['dates']) || !is_array($input['dates']))
            throw new Exception("Invalid Data");
        $userId = (int) $input['userId'];
        $dates = $input['dates'];
        $regionId = isset($input['regionId']) ? $input['regionId'] : null;

        $updated = processDB(function (&$db) use ($userId, $dates, $regionId) {
            if (!isset($db['date_selections']))
                $db['date_selections'] = [];

            // Add new dates if not exist
            foreach ($dates as $d) {
                $exists = false;
                foreach ($db['date_selections'] as $ds) {
                    if ((isset($ds['user_id']) ? $ds['user_id'] : 0) === $userId && (isset($ds['date']) ? $ds['date'] : '') === $d && (isset($ds['region_id']) ? $ds['region_id'] : null) === $regionId) {
                        $exists = true;
                        break;
                    }
                }
                if (!$exists) {
                    $item = ["id" => getNextId($db['date_selections']), "user_id" => $userId, "date" => $d];
                    if ($regionId)
                        $item['region_id'] = $regionId;
                    $db['date_selections'][] = $item;
                }
            }

            // Return updated list
            $ret = [];
            foreach ($db['date_selections'] as $ds) {
                if ((isset($ds['user_id']) ? $ds['user_id'] : 0) === $userId)
                    $ret[] = ['date' => $ds['date'], 'regionId' => isset($ds['region_id']) ? $ds['region_id'] : null];
            }
            return $ret;
        });

        echo json_encode(["userId" => $userId, "dateSelections" => $updated]);

    } elseif ($method === 'DELETE') {
        if (empty($input['userId']) || !isset($input['dates']))
            throw new Exception("Invalid Data");
        $userId = (int) $input['userId'];
        $dates = $input['dates'];

        processDB(function (&$db) use ($userId, $dates) {
            if (!isset($db['date_selections']))
                return;
            $db['date_selections'] = array_values(array_filter($db['date_selections'], function ($ds) use ($userId, $dates) {
                return !((isset($ds['user_id']) ? $ds['user_id'] : 0) === $userId && in_array((isset($ds['date']) ? $ds['date'] : ''), $dates));
            }));
            return true;
        });

        echo json_encode(["userId" => $userId, "dateSelections" => []]); // Simplified return
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
