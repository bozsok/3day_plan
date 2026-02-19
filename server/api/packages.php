<?php
require_once 'db.php';

// 1. CORS és Header-ek
handleOptions();
sendHeaders();

try {
    sendHeaders();
    handleOptions();
    $method = $_SERVER['REQUEST_METHOD'];

    // 1. GET: Csomagok lekérése
    if ($method === 'GET') {
        $data = readDB('packages.json');
        echo json_encode($data);
        exit;
    }

    // 2. POST: Csomagok mentése (Teljes lista felülírása)
    if ($method === 'POST') {
        $input = getJsonInput();
        if (!is_array($input)) {
            throw new Exception('Invalid JSON input', 400);
        }

        processDB(function (&$db) use ($input) {
            $db = $input; // Full overwrite
            return true;
        }, 'packages.json');

        echo json_encode(['success' => true, 'message' => 'Packages saved successfully']);
        exit;
    }

    throw new Exception('Method not allowed', 405);

} catch (Throwable $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>