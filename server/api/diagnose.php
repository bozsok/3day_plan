<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$result = [];
$result['php_version'] = phpversion();

// Path
$dbPath = __DIR__ . '/../data/db.json';
$result['db_path'] = $dbPath;

// Exists?
if (!file_exists($dbPath)) {
    $result['error'] = "File not found";
    echo json_encode($result);
    exit;
}

// Stats
$result['size'] = filesize($dbPath);
$result['perms'] = substr(sprintf('%o', fileperms($dbPath)), -4);

// Content Peek
$content = file_get_contents($dbPath);
if ($content === false) {
    $result['read_error'] = "Could not read file";
} else {
    $result['content_preview'] = substr($content, 0, 100);
    $result['content_length'] = strlen($content);

    // JSON Test
    $decoded = json_decode($content, true);
    if ($decoded === null) {
        $result['json_error'] = json_last_error_msg();
    } else {
        $result['json_valid'] = true;
        $result['keys'] = array_keys($decoded);
        $result['user_count'] = count($decoded['users'] ?? []);
        $result['vote_blocks_count'] = count($decoded['vote_blocks'] ?? []);
    }
}

echo json_encode($result);
exit;
