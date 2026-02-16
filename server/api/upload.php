<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Célkönyvtár meghatározása (relatív útvonal: ../public/uploads)
// Éles szerveren lehet, hogy máshol van a public mappa, ezt ellenőrizni kell.
// Itt most feltételezzük, hogy a szerver gyökerében van egy 'uploads' mappa vagy hasonló.
// Lokális fejlesztésnél: server/public/uploads

$uploadDir = __DIR__ . '/../public/uploads/';

if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create upload directory"]);
        exit;
    }
}

$uploadedFiles = [];
$errors = [];

// Több fájl kezelése
$files = $_FILES['images'] ?? null;

if (!$files) {
    http_response_code(400);
    echo json_encode(["error" => "No files uploaded"]);
    exit;
}

// Normalizálás: ha egy fájl jön, tömbösítjük
if (!is_array($files['name'])) {
    $files = [
        'name' => [$files['name']],
        'type' => [$files['type']],
        'tmp_name' => [$files['tmp_name']],
        'error' => [$files['error']],
        'size' => [$files['size']]
    ];
}

$count = count($files['name']);

for ($i = 0; $i < $count; $i++) {
    if ($files['error'][$i] !== UPLOAD_ERR_OK) {
        $errors[] = "Error uploading " . $files['name'][$i];
        continue;
    }

    $tmpName = $files['tmp_name'][$i];
    $originalName = basename($files['name'][$i]);
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    // Csak képek engedélyezése
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!in_array($ext, $allowed)) {
        $errors[] = "Invalid file type: " . $originalName;
        continue;
    }

    // Egyedi fájlnév generálása
    $newName = uniqid('img_', true) . '.' . $ext;
    $targetPath = $uploadDir . $newName;

    if (move_uploaded_file($tmpName, $targetPath)) {
        // Relatív útvonal visszaadása (public mappa nélkül, mert a webserver onnan szolgálja ki)
        // Ha a frontend a 'uploads/...' útvonalat kéri, akkor ez jó.
        $uploadedFiles[] = 'uploads/' . $newName;
    } else {
        $errors[] = "Failed to move uploaded file: " . $originalName;
    }
}

if (!empty($errors)) {
    http_response_code(500); // Vagy 207 Multi-Status
    echo json_encode(["error" => "Some files failed to upload", "details" => $errors, "uploaded" => $uploadedFiles]);
} else {
    echo json_encode(["success" => true, "files" => $uploadedFiles]);
}
?>