<?php
require_once __DIR__ . '/db.php';

// Production: disable direct error display
ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    sendHeaders();
    handleOptions();

    $method = $_SERVER['REQUEST_METHOD'];
    $input = getJsonInput();

    if ($method === 'GET') {
        if (!isset($_GET['userId']))
            throw new Exception("Missing userId", 400);

        $userId = (int) $_GET['userId'];
        $db = readDB();

        $user = null;
        foreach (($db['users'] ?? []) as $u) {
            if (($u['id'] ?? 0) === $userId) {
                $user = $u;
                break;
            }
        }

        if ($user) {
            $dsList = [];
            foreach (($db['date_selections'] ?? []) as $d) {
                if (($d['user_id'] ?? 0) === $userId) {
                    $dsList[] = ['date' => $d['date'], 'regionId' => $d['region_id'] ?? null];
                }
            }
            $vbList = [];
            foreach (($db['vote_blocks'] ?? []) as $v) {
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
            echo json_encode([
                "id" => $user['id'],
                "name" => $user['name'],
                "dateSelections" => $dsList,
                "voteBlocks" => $vbList
            ]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "User not found"]);
        }

    } elseif ($method === 'POST') {
        if (empty($input['name']) || empty($input['password']))
            throw new Exception("Name and Password required", 400);

        $name = trim($input['name']);
        $password = $input['password'];

        if (!verifyPassword($password)) {
            http_response_code(401);
            echo json_encode(["error" => "Hibás jelszó"]);
            exit;
        }

        $res = processDB(function (&$db) use ($name) {
            if (!isset($db['users']))
                $db['users'] = [];
            foreach ($db['users'] as $u) {
                if (strcasecmp($u['name'] ?? '', $name) === 0)
                    return $u;
            }
            $new = [
                "id" => getNextId($db['users']),
                "name" => $name,
                "created_at" => date('Y-m-d H:i:s')
            ];
            $db['users'][] = $new;
            return $new;
        });

        echo json_encode(["id" => $res['id'], "name" => $res['name']]);
    }

} catch (Throwable $e) {
    if (!headers_sent()) {
        http_response_code($e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
        header('Content-Type: application/json');
    }
    echo json_encode([
        "error" => $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ]);
}
