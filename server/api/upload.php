require_once __DIR__ . '/db.php';

// Production: disable direct error display
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Logger függvény
$logFile = __DIR__ . '/debug_log.txt';
function writeLog($message)
{
global $logFile;
$date = date('Y-m-d H:i:s');
@file_put_contents($logFile, "[$date] $message" . PHP_EOL, FILE_APPEND);
}

try {
sendHeaders();
handleOptions();
writeLog("Upload request started. Method: " . $_SERVER['REQUEST_METHOD']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
throw new Exception("Method not allowed", 405);
}

// Méret korlátok ellenőrzése
$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
$postMaxSize = ini_get('post_max_size');
$uploadMaxFilesize = ini_get('upload_max_filesize');

writeLog("Content-Length: $contentLength, post_max_size: $postMaxSize, upload_max_filesize: $uploadMaxFilesize");

if (empty($_POST) && empty($_FILES) && $contentLength > 0) {
throw new Exception("POST data is empty. Possible limit exceeded. post_max_size: $postMaxSize", 413);
}

$uploadDir = __DIR__ . '/uploads/';
if (!file_exists($uploadDir)) {
if (!@mkdir($uploadDir, 0755, true)) {
$err = error_get_last();
throw new Exception("Failed to create upload directory. Error: " . ($err['message'] ?? 'Unknown'));
}
}

if (!is_writable($uploadDir)) {
throw new Exception("Upload directory is not writable: $uploadDir");
}

$uploadedFiles = [];
$files = $_FILES['images'] ?? null;

if (!$files) {
throw new Exception("No 'images' file found in request.", 400);
}

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
for ($i = 0; $i < $count; $i++) { if ($files['error'][$i] !==UPLOAD_ERR_OK) { throw new Exception("Upload error
    code: " . $files['error'][$i] . " for file " . $files['name'][$i]);
        }

        $tmpName = $files['tmp_name'][$i];
        $originalName = basename($files['name'][$i]);
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

        if (!in_array($ext, $allowed)) {
            throw new Exception(" Invalid file type: $ext"); } $newName=uniqid('img_') . '.' . $ext;
    $targetPath=$uploadDir . $newName; if (move_uploaded_file($tmpName, $targetPath)) { $uploadedFiles[]='uploads/' .
    $newName; writeLog("Saved: $targetPath"); } else { throw new Exception("Failed to move uploaded file to
    $targetPath"); } } echo json_encode(["status"=> "success", "files" => $uploadedFiles]);

    } catch (Throwable $e) {
    http_response_code($e->getCode() ?: 500);
    writeLog("ERROR: " . $e->getMessage());
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    ?>