<?php
require_once 'db.php';

// 1. CORS és Header-ek
handleOptions();
sendHeaders();

// 2. Útvonalak meghatározása
$PACKAGES_FILE = __DIR__ . '/../data/packages.json';

// 3. GET: Csomagok lekérése
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($PACKAGES_FILE)) {
        readfile($PACKAGES_FILE);
    } else {
        // Ha még nincs fájl, üres tömböt adunk vissza
        echo json_encode([]);
    }
    exit;
}

// 4. POST: Csomagok mentése (Teljes lista felülírása)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // TODO: Itt később be kell vezetni egy admin jelszó ellenőrzést (Authorization header)

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        exit;
    }

    // Biztonsági mentés készítése (opcionális, de ajánlott)
    if (file_exists($PACKAGES_FILE)) {
        copy($PACKAGES_FILE, $PACKAGES_FILE . '.bak');
    }

    // Mentés
    if (file_put_contents($PACKAGES_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(['success' => true, 'message' => 'Packages saved successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to write to packages.json']);
    }
    exit;
}

// Egyéb metódusok
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>