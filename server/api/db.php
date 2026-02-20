<?php

// 1. Helper: Send Headers
function sendHeaders()
{
    if (headers_sent())
        return;
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Type: application/json; charset=UTF-8");

    // Disable caching strictly
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
}

// 2. Helper: Handle Preflight OPTIONS
function handleOptions()
{
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        sendHeaders();
        http_response_code(200);
        exit;
    }
}

// 3. Helper: Get JSON Input
function getJsonInput()
{
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}

// 4. Helper: Get DB Path & Ensure Directory
function getDBPath($filename = 'db.json')
{
    $path = __DIR__ . '/../data/' . $filename;
    $dir = dirname($path);
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
    return $path;
}

// 5. Helper: Read DB (No Lock for Speed/Stability)
function readDB($filename = 'db.json')
{
    $path = getDBPath($filename);
    $defaultDB = ["users" => [], "date_selections" => [], "vote_blocks" => []];
    if ($filename === 'progress.json' || $filename === 'packages.json')
        $defaultDB = [];

    if (!file_exists($path))
        return $defaultDB;

    $json = @file_get_contents($path);
    if ($json === false)
        return $defaultDB;

    $data = json_decode($json, true);
    return is_array($data) ? $data : $defaultDB;
}

// 6. Helper: Process DB (Write Lock)
function processDB(callable $callback, $filename = 'db.json')
{
    $path = getDBPath($filename);
    $defaultDB = ["users" => [], "date_selections" => [], "vote_blocks" => []];
    if ($filename === 'progress.json' || $filename === 'packages.json')
        $defaultDB = [];

    $fp = @fopen($path, 'c+');
    if (!$fp) {
        http_response_code(500);
        echo json_encode(["error" => "Database IO error: " . $filename]);
        exit;
    }

    if (flock($fp, LOCK_EX)) {
        $json = stream_get_contents($fp);
        $db = !empty($json) ? json_decode($json, true) : $defaultDB;
        if (!is_array($db))
            $db = $defaultDB;

        try {
            $result = $callback($db);
        } catch (Exception $e) {
            flock($fp, LOCK_UN);
            fclose($fp);
            throw $e;
        }

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        return $result;
    } else {
        fclose($fp);
        http_response_code(503);
        echo json_encode(["error" => "Database busy"]);
        exit;
    }
}

// 7. Helper: ID Generator
function getNextId($array)
{
    if (empty($array))
        return 1;
    $maxId = 0;
    foreach ($array as $item) {
        if (isset($item['id']) && $item['id'] > $maxId)
            $maxId = $item['id'];
    }
    return $maxId + 1;
}

// 8. Helper: Verify Password
function verifyPassword($password)
{
    $config = require __DIR__ . '/config.php';
    $hash = $config['admin_password'];
    // Támogatjuk a sima szöveget is az egyszerűség kedvéért, ha nem hash
    if (strpos($hash, '$2y$') === 0) {
        return password_verify($password, $hash);
    }
    return $password === $hash;
}