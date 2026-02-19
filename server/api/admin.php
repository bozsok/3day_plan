<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Production: disable direct error display
ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    sendHeaders();
    handleOptions();
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    if ($method === 'POST' && $action === 'reset') {
        processDB(function (&$db) {
            $db['users'] = [];
            $db['date_selections'] = [];
            $db['vote_blocks'] = [];
            return true;
        });
        // Clear progress.json as well on full reset
        $progressPath = __DIR__ . '/../data/progress.json';
        if (file_exists($progressPath)) {
            file_put_contents($progressPath, json_encode([]));
        }
        echo json_encode(["message" => "Reset OK"]);

    } elseif ($method === 'POST' && $action === 'reset_user_vote' && isset($_GET['id'])) {
        $userId = (int) $_GET['id'];
        processDB(function (&$db) use ($userId) {
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
        // Clear progress for this user
        $progressPath = __DIR__ . '/../data/progress.json';
        if (file_exists($progressPath)) {
            $pJson = file_get_contents($progressPath);
            $pData = json_decode($pJson, true);
            if (is_array($pData) && isset($pData[$userId])) {
                unset($pData[$userId]);
                file_put_contents($progressPath, json_encode($pData, JSON_PRETTY_PRINT));
            }
        }
        echo json_encode(["message" => "User vote reset OK"]);

    } elseif ($method === 'DELETE' && isset($_GET['id'])) {
        $userId = (int) $_GET['id'];
        processDB(function (&$db) use ($userId) {
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
        // Clear progress for this user
        $progressPath = __DIR__ . '/../data/progress.json';
        if (file_exists($progressPath)) {
            $pJson = file_get_contents($progressPath);
            $pData = json_decode($pJson, true);
            if (is_array($pData) && isset($pData[$userId])) {
                unset($pData[$userId]);
                file_put_contents($progressPath, json_encode($pData, JSON_PRETTY_PRINT));
            }
        }
        echo json_encode(["message" => "Deleted OK"]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid Request"]);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
