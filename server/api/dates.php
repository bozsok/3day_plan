<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// POST /api/dates.php (Mentés) vagy DELETE /api/dates.php (Törlés)
if ($method === 'POST' || $method === 'DELETE') {
    $input = getJsonInput();

    if (empty($input['userId']) || !isset($input['dates']) || !is_array($input['dates'])) {
        http_response_code(400);
        echo json_encode(["error" => "userId és dates tömb kötelező"]);
        exit;
    }

    $userId = (int) $input['userId'];
    $datesToProcess = $input['dates'];

    $regionId = isset($input['regionId']) ? $input['regionId'] : null;

    // Atomi művelet: Hozzáadás vagy Törlés
    $updatedUserDates = processDB(function (&$db) use ($userId, $datesToProcess, $method, $regionId) {
        // Inicializálás
        if (!isset($db['date_selections']))
            $db['date_selections'] = [];

        if ($method === 'POST') {
            // --- MENTÉS (APPEND LOGIKA) ---
            // Nem törlünk semmit, csak hozzáadunk.
            // A felhasználó "építi" a dátumait. Törölni a "Visszavonás" gombbal tud mindent.

            foreach ($datesToProcess as $date) {
                // Ellenőrzés: Van-e már ez a dátum EZZEL a régióval?
                $exists = false;
                foreach ($db['date_selections'] as $ds) {
                    $dsRegion = $ds['region_id'] ?? null;
                    if ($ds['user_id'] === $userId && $ds['date'] === $date && $dsRegion === $regionId) {
                        $exists = true;
                        break;
                    }
                }

                if (!$exists) {
                    $item = [
                        "id" => getNextId($db['date_selections']),
                        "user_id" => $userId,
                        "date" => $date
                    ];
                    if ($regionId) {
                        $item["region_id"] = $regionId;
                    }
                    $db['date_selections'][] = $item;
                }
            }
        } elseif ($method === 'DELETE') {
            // --- TÖRLÉS ---
            $db['date_selections'] = array_values(array_filter($db['date_selections'], function ($ds) use ($userId, $datesToProcess) {
                if ($ds['user_id'] === $userId && in_array($ds['date'], $datesToProcess)) {
                    return false; // Törlés
                }
                return true;
            }));

            // Map frissítése felesleges, mert újraépítjük a végén
        }

        // Visszatérés a dátumok listájával (dateSelections objektumok)
        $userDateSelections = [];
        if (isset($db['date_selections'])) {
            foreach ($db['date_selections'] as $ds) {
                if ($ds['user_id'] === $userId) {
                    $userDateSelections[] = [
                        'date' => $ds['date'],
                        'regionId' => $ds['region_id'] ?? null
                    ];
                }
            }
        }
        return $userDateSelections;
    });

    echo json_encode([
        "userId" => $userId,
        "dateSelections" => $updatedUserDates
    ]);
}
?>