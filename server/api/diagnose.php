<?php
header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
error_reporting(E_ALL);
ini_set('display_errors', 1);

$result = [
    'status' => 'diagnostic_mode',
    'php_version' => PHP_VERSION,
    'server_software' => $_SERVER['SERVER_SOFTWARE'],
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'cwd' => getcwd(),
    'files' => [
        'db.php' => file_exists(__DIR__ . '/db.php'),
        'db.json' => file_exists(__DIR__ . '/../data/db.json'),
        'progress.json' => file_exists(__DIR__ . '/../data/progress.json'),
    ],
    'permissions' => [
        'data_dir' => is_dir(__DIR__ . '/../data') ? (is_writable(__DIR__ . '/../data') ? 'writable' : 'not_writable') : 'missing',
        'db_json' => file_exists(__DIR__ . '/../data/db.json') ? (is_writable(__DIR__ . '/../data/db.json') ? 'writable' : 'not_writable') : 'n/a',
    ]
];

try {
    require_once __DIR__ . '/db.php';
    $result['db_php_load'] = 'success';

    // Test DB read
    if (file_exists(__DIR__ . '/../data/db.json')) {
        $content = file_get_contents(__DIR__ . '/../data/db.json');
        $decoded = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $result['db_json_error'] = json_last_error_msg();
        } else {
            $result['json_valid'] = true;
            $result['keys'] = array_keys($decoded);
            $result['user_count'] = count(isset($decoded['users']) ? $decoded['users'] : []);
            $result['vote_blocks_count'] = count(isset($decoded['vote_blocks']) ? $decoded['vote_blocks'] : []);
        }
    }
} catch (Exception $e) {
    $result['error'] = $e->getMessage();
    $result['trace'] = $e->getTraceAsString();
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
