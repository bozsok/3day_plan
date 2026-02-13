<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$method = $_SERVER['REQUEST_METHOD'];
// $db = loadDB(); // TÖRÖLVE: processDB vagy readDB kezeli lokálisan


// GET /api/users.php?userId=X - Updated: 2026-02-13
if ($method === 'GET') {
    if (!isset($_GET['userId'])) {
        http_response_code(400);
        echo json_encode(["error" => "userId megadása kötelező"]);
        exit;
    }

    $userId = (int) $_GET['userId'];
    $db = readDB(); // Csak olvasás -> Shared Lock
    $user = null;

    foreach ($db['users'] as $u) {
        if ($u['id'] === $userId) {
            $user = $u;
            break;
        }
    }

    if ($user) {
        // 1. Dátumok (date_selections)
        $dateSelections = [];
        if (isset($db['date_selections'])) {
            foreach ($db['date_selections'] as $d) {
                if ($d['user_id'] === $userId) {
                    $dateSelections[] = [
                        'date' => $d['date'],
                        'regionId' => $d['region_id'] ?? null
                    ];
                }
            }
        }

        // 2. Szavazatok (vote_blocks)
        $voteBlocks = [];
        if (isset($db['vote_blocks'])) {
            foreach ($db['vote_blocks'] as $v) {
                if ($v['user_id'] === $userId) {
                    $voteBlocks[] = [
                        'id' => $v['id'],
                        'regionId' => $v['region_id'],
                        'dates' => $v['dates'], // Array
                        'createdAt' => $v['created_at']
                    ];
                }
            }
        }

        echo json_encode([
            "id" => $user['id'],
            "name" => $user['name'],
            "dateSelections" => $dateSelections,
            "voteBlocks" => $voteBlocks
        ]);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Felhasználó nem található"]);
    }
}


// POST /api/users.php (Login / Regisztráció)
elseif ($method === 'POST') {
    $input = getJsonInput();
    if (empty($input['name'])) {
        http_response_code(400);
        echo json_encode(["error" => "Név megadása kötelező"]);
        exit;
    }

    $name = trim($input['name']);

    // Atomi művelet: Keresés vagy Létrehozás
    $resultUser = processDB(function (&$db) use ($name) {
        // 1. Keresés
        foreach ($db['users'] as $u) {
            if (strcasecmp($u['name'], $name) === 0) {
                return $u; // Megvan, visszaadjuk
            }
        }

        // 2. Létrehozás (ha nincs)
        $newId = getNextId($db['users'] ?? []);
        $newUser = [
            "id" => $newId,
            "name" => $name,
            "created_at" => date('Y-m-d H:i:s')
        ];

        if (!isset($db['users']))
            $db['users'] = [];
        $db['users'][] = $newUser;

        return $newUser; // Visszaadjuk az újat
    });

    echo json_encode([
        "id" => $resultUser['id'],
        "name" => $resultUser['name']
    ]);
}
?>