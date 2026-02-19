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
        if (empty($input['userId']))
            throw new Exception("userId required");
        $userId = (int) $input['userId'];

        processDB(function (&$db) use ($userId, $input) {
            $now = time();

            // Passzív takarítás (15 perc után töröljük az inaktívakat)
            foreach ($db as $uid => $data) {
                if ((isset($data['lastActive']) ? $data['lastActive'] : 0) < ($now - 900)) {
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
        }, 'progress.json');

        echo json_encode(["status" => "success"]);

    } elseif ($method === 'DELETE' || (isset($_GET['action']) && $_GET['action'] === 'clear')) {
        $userId = isset($input['userId']) ? (int) $input['userId'] : (isset($_GET['userId']) ? (int) $_GET['userId'] :
            null);

        if ($userId) {
            processDB(function (&$db) use ($userId) {
                if (isset($db[$userId])) {
                    unset($db[$userId]);
                    return true;
                }
                return false;
            }, 'progress.json');
        }
        echo json_encode(["status" => "cleared"]);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
