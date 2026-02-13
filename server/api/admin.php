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

    $fp = fopen($dbPath, 'c+');
    if (!$fp)
        throw new Exception("DB IO Error");

    if (flock($fp, LOCK_EX)) {
        $size = fstat($fp)['size'];
        $json = $size > 0 ? fread($fp, $size) : '';
        $db = json_decode($json, true);
        if (!is_array($db))
            $db = ["users" => [], "date_selections" => [], "vote_blocks" => []];

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

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    if ($method === 'POST' && $action === 'reset') {
        safeProcessDB(function (&$db) {
            $db['users'] = [];
            $db['date_selections'] = [];
            $db['vote_blocks'] = [];
            return true;
        });
        echo json_encode(["message" => "Reset OK"]);

    } elseif ($method === 'DELETE' && isset($_GET['id'])) {
        $userId = (int) $_GET['id'];
        safeProcessDB(function (&$db) use ($userId) {
            if (isset($db['users'])) {
                $db['users'] = array_values(array_filter($db['users'], function ($u) use ($userId) {
                    return ($u['id'] ?? 0) !== $userId;
                }));
            }
            if (isset($db['date_selections'])) {
                $db['date_selections'] = array_values(array_filter($db['date_selections'], function ($ds) use ($userId) {
                    return ($ds['user_id'] ?? 0) !== $userId;
                }));
            }
            if (isset($db['vote_blocks'])) {
                $db['vote_blocks'] = array_values(array_filter($db['vote_blocks'], function ($vb) use ($userId) {
                    return ($vb['user_id'] ?? 0) !== $userId;
                }));
            }
            return true;
        });
        echo json_encode(["message" => "Deleted OK"]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid Request"]);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}