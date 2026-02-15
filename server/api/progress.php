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

/**
 * Biztonságos állománykezelés (Lock-olással)
 */
function safeProcessProgress(callable $callback)
{
    $dbPath = __DIR__ . '/../data/progress.json';
    $dir = dirname($dbPath);
    if (!is_dir($dir))
        @mkdir($dir, 0777, true);

    $fp = fopen($dbPath, 'c+');
    if (!$fp)
        throw new Exception("Progress IO Error");

    if (flock($fp, LOCK_EX)) {
        $size = fstat($fp)['size'];
        $json = $size > 0 ? fread($fp, $size) : '';
        $db = json_decode($json, true);
        if (!is_array($db))
            $db = [];

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
    $input = json_decode(file_get_contents('php://input'), true);

    if ($method === 'POST') {
        if (empty($input['userId']))
            throw new Exception("userId required");
        $userId = (int) $input['userId'];

        safeProcessProgress(function (&$db) use ($userId, $input) {
            $now = time();

            // Passzív takarítás (15 perc után töröljük az inaktívakat)
            foreach ($db as $uid => $data) {
                if (($data['lastActive'] ?? 0) < ($now - 900)) {
                    unset($db[$uid]);
                }
            }

            if (!isset($db[$userId])) {
                $db[$userId] = [
                    'hasDates' => false,
                    'regionId' => null,
                    'packageId' => null,
                    'lastActive' => $now
                ];
            }

            // Csak azokat a mezőket frissítjük, amik érkeztek
            if (isset($input['hasDates'])) {
                $db[$userId]['hasDates'] = (bool) $input['hasDates'];
            }
            if (array_key_exists('regionId', $input)) {
                $db[$userId]['regionId'] = $input['regionId']; // Null is valid
            }
            if (isset($input['packageId'])) {
                $db[$userId]['packageId'] = $input['packageId']; // Null is valid
            }
            if (isset($input['dates'])) {
                $db[$userId]['dates'] = $input['dates']; // Array of strings
            }

            $db[$userId]['lastActive'] = $now;
            return true;
        });

        echo json_encode(["status" => "success"]);

    } elseif ($method === 'DELETE' || (isset($_GET['action']) && $_GET['action'] === 'clear')) {
        $userId = isset($input['userId']) ? (int) $input['userId'] : (isset($_GET['userId']) ? (int) $_GET['userId'] : null);

        if ($userId) {
            safeProcessProgress(function (&$db) use ($userId) {
                if (isset($db[$userId])) {
                    unset($db[$userId]);
                    return true;
                }
                return false;
            });
        }
        echo json_encode(["status" => "cleared"]);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
