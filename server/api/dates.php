<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

ini_set('display_errors', 0);
error_reporting(E_ALL);

function safeProcessDB(callable $callback)
{
    $dbPath = __DIR__ . '/../data/db.json';
    $dir = dirname($dbPath);
    if (!is_dir($dir))
        @mkdir($dir, 0777, true);

    $fp = fopen($dbPath, 'c+'); // Create if not exists, don't truncate yet
    if (!$fp)
        throw new Exception("DB IO Error");

    if (flock($fp, LOCK_EX)) {
        $size = fstat($fp)['size'];
        $json = $size > 0 ? fread($fp, $size) : '';
        $db = json_decode($json, true);
        if (!is_array($db))
            $db = ["users" => [], "date_selections" => [], "vote_blocks" => []]; // INIT structure

        try {
            $result = $callback($db);
        } catch (Exception $e) {
            flock($fp, LOCK_UN);
            fclose($fp);
            throw $e;
        }

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);
        return $result;
    } else {
        fclose($fp);
        throw new Exception("DB Busy");
    }
}

function getNextId($arr)
{
    if (empty($arr))
        return 1;
    $max = 0;
    foreach ($arr as $i)
        if (($i['id'] ?? 0) > $max)
            $max = $i['id'];
    return $max + 1;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    if ($method === 'POST') {
        if (empty($input['userId']) || !isset($input['dates']) || !is_array($input['dates']))
            throw new Exception("Invalid Data");
        $userId = (int) $input['userId'];
        $dates = $input['dates'];
        $regionId = $input['regionId'] ?? null;

        $updated = safeProcessDB(function (&$db) use ($userId, $dates, $regionId) {
            if (!isset($db['date_selections']))
                $db['date_selections'] = [];

            // Add new dates if not exist
            foreach ($dates as $d) {
                $exists = false;
                foreach ($db['date_selections'] as $ds) {
                    if (($ds['user_id'] ?? 0) === $userId && ($ds['date'] ?? '') === $d && ($ds['region_id'] ?? null) === $regionId) {
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
                if (($ds['user_id'] ?? 0) === $userId)
                    $ret[] = ['date' => $ds['date'], 'regionId' => $ds['region_id'] ?? null];
            }
            return $ret;
        });

        echo json_encode(["userId" => $userId, "dateSelections" => $updated]);

    } elseif ($method === 'DELETE') {
        if (empty($input['userId']) || !isset($input['dates']))
            throw new Exception("Invalid Data");
        $userId = (int) $input['userId'];
        $dates = $input['dates'];

        safeProcessDB(function (&$db) use ($userId, $dates) {
            if (!isset($db['date_selections']))
                return;
            $db['date_selections'] = array_values(array_filter($db['date_selections'], function ($ds) use ($userId, $dates) {
                return !(($ds['user_id'] ?? 0) === $userId && in_array(($ds['date'] ?? ''), $dates));
            }));
            return true;
        });

        echo json_encode(["userId" => $userId, "dateSelections" => []]); // Simplified return
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}