<?php
// 1. Alapvető konfiguráció - JSON válasz garantálása
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

// 2. Logger függvény
$logFile = __DIR__ . '/debug_log.txt';
function writeLog($message)
{
    global $logFile;
    $date = date('Y-m-d H:i:s');
    // Próbálunk logolni fájlba, ha írható
    @file_put_contents($logFile, "[$date] $message" . PHP_EOL, FILE_APPEND);
}

writeLog("Request started. Method: " . $_SERVER['REQUEST_METHOD']);

// 3. OPTIONS kérés kezelése (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 4. Fatal error handler
function shutdownHandler()
{
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        $msg = "FATAL: " . $error['message'] . " in " . $error['file'] . ":" . $error['line'];
        writeLog($msg);
        echo json_encode(["error" => "Server Fatal Error", "details" => $msg]);
    }
}
register_shutdown_function('shutdownHandler');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Method not allowed", 405);
    }

    // 5. Méret korlátok ellenőrzése
    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    $postMaxSize = ini_get('post_max_size');
    $uploadMaxFilesize = ini_get('upload_max_filesize');

    writeLog("Content-Length: $contentLength, post_max_size: $postMaxSize, upload_max_filesize: $uploadMaxFilesize");

    // Ha a POST adat üres, de volt Content-Length, akkor valószínűleg túlléptük a limitet
    if (empty($_POST) && empty($_FILES) && $contentLength > 0) {
        throw new Exception("POST data is empty. Possible limit exceeded. post_max_size: $postMaxSize", 413);
    }

    // 6. Könyvtár kezelés
    // Megpróbáljuk a lokális 'uploads' mappát a script mellett, ez a legbiztosabb
    $uploadDir = __DIR__ . '/uploads/';

    if (!file_exists($uploadDir)) {
        writeLog("Upload dir missing, trying mkdir: $uploadDir");
        if (!@mkdir($uploadDir, 0755, true)) {
            $err = error_get_last();
            throw new Exception("Failed to create upload directory. Parent writable? " . (is_writable(__DIR__) ? 'YES' : 'NO') . ". Error: " . $err['message']);
        }
    }

    if (!is_writable($uploadDir)) {
        throw new Exception("Upload directory is not writable: $uploadDir");
    }

    $uploadedFiles = [];
    $files = $_FILES['images'] ?? null;

    if (!$files) {
        throw new Exception("No 'images' file found in request. Files dump: " . print_r($_FILES, true), 400);
    }

    writeLog("Files dump: " . print_r($files, true));

    // Normalizálás
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
    writeLog("Processing $count files...");

    for ($i = 0; $i < $count; $i++) {
        if ($files['error'][$i] !== UPLOAD_ERR_OK) {
            writeLog("File error [" . $files['name'][$i] . "]: Code " . $files['error'][$i]);
            throw new Exception("Upload error code: " . $files['error'][$i] . " for file " . $files['name'][$i]);
        }

        $tmpName = $files['tmp_name'][$i];
        $originalName = basename($files['name'][$i]);
        writeLog("Docs: Name='$originalName' Temp='$tmpName'");
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        writeLog("Extracted extension: '$ext'");
        $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

        if (!in_array($ext, $allowed)) {
            throw new Exception("Invalid file type: $ext");
        }

        $newName = uniqid('img_') . '.' . $ext;
        $targetPath = $uploadDir . $newName;

        if (move_uploaded_file($tmpName, $targetPath)) {
            // Relatív URL generálása
            // Mivel most a server/api/uploads-ba mentünk, a kliensnek ennek megfelelő path kell
            // Ha a kliens a server/api címet használja base-nek, akkor 'uploads/nev' a jó
            $uploadedFiles[] = 'uploads/' . $newName;
            writeLog("Saved: $targetPath");
        } else {
            throw new Exception("Failed to move uploaded file to $targetPath");
        }
    }

    echo json_encode(["status" => "success", "files" => $uploadedFiles]);

} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    $msg = $e->getMessage();
    writeLog("ERROR: $msg");
    echo json_encode(["status" => "error", "message" => $msg]);
}
?>