<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// POST /api/votes.php (Új szavazási blokk létrehozása) - Fixed: 2026-02-13 (Atomic ProcessDB + Loose Type Check)
if ($method === 'POST') {
    $input = getJsonInput();
    if (empty($input['userId']) || empty($input['regionId']) || empty($input['dates']) || !is_array($input['dates'])) {
        http_response_code(400);
        echo json_encode(["error" => "userId, regionId és dates (tömb) kötelező"]);
        exit;
    }

    $dates = $input['dates'];
    if (count($dates) !== 3) {
        http_response_code(400);
        echo json_encode(["error" => "Pontosan 3 dátumot kell megadni"]);
        exit;
    }

    $userId = (int) $input['userId'];
    $regionId = $input['regionId'];

    // Atomi művelet: Olvasás + Ellenőrzés + Írás egy blokkban
    $result = processDB(function (&$db) use ($userId, $regionId, $dates) {
        if (!isset($db['vote_blocks'])) {
            $db['vote_blocks'] = [];
        }

        // 1. Ellenőrzés: Van-e már PONTOSAN ILYEN szavazata? (Belül, a valid DB-n)
        $existingBlock = null;
        sort($dates); // Dátumrendezés

        foreach ($db['vote_blocks'] as $block) {
            // Lazább típusellenőrzés (==) a string/int konverziók miatt
            if ($block['user_id'] == $userId && $block['region_id'] == $regionId) {
                $blockDates = $block['dates'];
                sort($blockDates);
                if ($blockDates == $dates) {
                    $existingBlock = $block;
                    break;
                }
            }
        }

        if ($existingBlock) {
            // Idempotencia: Már létezik, visszaadjuk a régit, NEM írunk újat
            return $existingBlock;
        } else {
            // ÚJ szavazat
            $newBlock = [
                "id" => getNextId($db['vote_blocks']),
                "user_id" => $userId,
                "region_id" => $regionId,
                "dates" => $dates,
                "created_at" => date('Y-m-d H:i:s')
            ];
            $db['vote_blocks'][] = $newBlock;
            return $newBlock;
        }
    });

    // A $result tartalmazza a blokkot (régi vagy új)
    echo json_encode([
        "success" => true,
        "block" => [
            "id" => $result['id'],
            "regionId" => $result['region_id'],
            "dates" => $result['dates'],
            "createdAt" => $result['created_at']
        ]
    ]);
}

// DELETE /api/votes.php (Blokk törlése)
elseif ($method === 'DELETE') {
    $input = getJsonInput();
    if (empty($input['userId']) || empty($input['blockId'])) {
        http_response_code(400);
        echo json_encode(["error" => "userId és blockId kötelező"]);
        exit;
    }

    $userId = (int) $input['userId'];
    $blockId = (int) $input['blockId'];

    processDB(function (&$db) use ($userId, $blockId) {
        if (!isset($db['vote_blocks']))
            return false;

        $originalCount = count($db['vote_blocks']);

        // Keressük meg a törlendő blokkot (validációhoz és esetleges dátumtörléshez)
        $blockToDelete = null;
        foreach ($db['vote_blocks'] as $block) {
            if ($block['id'] === $blockId && $block['user_id'] === $userId) {
                $blockToDelete = $block;
                break;
            }
        }

        if (!$blockToDelete)
            return false; // Nem található vagy nem a useré

        // 1. Blokk törlése
        $db['vote_blocks'] = array_values(array_filter($db['vote_blocks'], function ($block) use ($blockId) {
            return $block['id'] !== $blockId;
        }));

        // 2. Kapcsolódó dátumok törlése (IGEN, a SPEC szerint)
        // Csak azokat töröljük, amik:
        // - Ugyanaz a user
        // - Ugyanaz a régió (mint a blokké)
        // - Benne vannak a blokk dátumaiban
        if (isset($db['date_selections'])) {
            $datesToRemove = $blockToDelete['dates'];
            $regionId = $blockToDelete['region_id'];

            $db['date_selections'] = array_values(array_filter($db['date_selections'], function ($ds) use ($userId, $regionId, $datesToRemove) {
                if (
                    $ds['user_id'] === $userId &&
                    ($ds['region_id'] ?? null) === $regionId &&
                    in_array($ds['date'], $datesToRemove)
                ) {
                    return false; // Törlés
                }
                return true; // Marad
            }));
        }

        return true;
    });

    echo json_encode(["success" => true]);
}

// GET /api/votes.php
elseif ($method === 'GET') {
    $userId = isset($_GET['userId']) ? (int) $_GET['userId'] : null;
    $db = readDB();

    $voteBlocks = [];
    if (isset($db['vote_blocks'])) {
        foreach ($db['vote_blocks'] as $v) {
            if (!$userId || $v['user_id'] === $userId) {
                $voteBlocks[] = [
                    'id' => $v['id'],
                    'regionId' => $v['region_id'],
                    'dates' => $v['dates'],
                    'createdAt' => $v['created_at']
                ];
            }
        }
    }
    echo json_encode($voteBlocks);
}
?>