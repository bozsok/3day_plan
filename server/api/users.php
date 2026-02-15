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

function safeReadDB()
{
    $dbPath = __DIR__ . '/../data/db.json';
    if (!file_exists($dbPath))
        return ["users" => [], "vote_blocks" => [], "date_selections" => []];
    $json = @file_get_contents($dbPath);
    return json_decode($json, true) ?: ["users" => [], "vote_blocks" => [], "date_selections" => []];
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

    if ($method === 'GET') {
        if (!isset($_GET['userId']))
            throw new Exception("Missing userId");
        $userId = (int) $_GET['userId'];
        $db = safeReadDB();

        $user = null;
        if (!empty($db['users'])) {
            foreach ($db['users'] as $u) {
                if (($u['id'] ?? 0) === $userId) {
                    $user = $u;
                    break;
                }
            }
        }

        if ($user) {
            $dsList = [];
            if (!empty($db['date_selections'])) {
                foreach ($db['date_selections'] as $d) {
                    if (($d['user_id'] ?? 0) === $userId)
                        $dsList[] = ['date' => $d['date'], 'regionId' => $d['region_id'] ?? null];
                }
            }
            $vbList = [];
            if (!empty($db['vote_blocks'])) {
                foreach ($db['vote_blocks'] as $v) {
                    if (($v['user_id'] ?? 0) === $userId) {
                        $vbList[] = [
                            "id" => $v['id'],
                            "userId" => $v['user_id'],
                            "regionId" => $v['region_id'],
                            "packageId" => $v['package_id'] ?? null,
                            "dates" => $v['dates'],
                            "createdAt" => $v['created_at']
                        ];
                    }
                }
            }
            echo json_encode([
                "id" => $user['id'],
                "name" => $user['name'],
                "dateSelections" => $dsList,
                "voteBlocks" => $vbList
            ]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Not Found"]);
        }

    } elseif ($method === 'POST') {
        if (empty($input['name']))
            throw new Exception("Name required");
        $name = trim($input['name']);

        $res = safeProcessDB(function (&$db) use ($name) {
            if (!isset($db['users']))
                $db['users'] = [];
            foreach ($db['users'] as $u) {
                if (strcasecmp($u['name'] ?? '', $name) === 0)
                    return $u;
            }
            $new = ["id" => getNextId($db['users']), "name" => $name, "created_at" => date('Y-m-d H:i:s')];
            $db['users'][] = $new;
            return $new;
        });

        echo json_encode(["id" => $res['id'], "name" => $res['name']]);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}