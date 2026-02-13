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
function getDBPath()
{
    $path = __DIR__ . '/../data/db.json';
    $dir = dirname($path);
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
    return $path;
}

// 5. Helper: Read DB (No Lock for Speed/Stability)
function readDB()
{
    $path = getDBPath();
    $defaultDB = ["users" => [], "date_selections" => [], "vote_blocks" => []];

    if (!file_exists($path))
        return $defaultDB;

    // Simple read without lock to avoid file system issues
    $json = @file_get_contents($path);
    if ($json === false)
        return $defaultDB;

    $data = json_decode($json, true);
    return is_array($data) ? $data : $defaultDB;
}

// 6. Helper: Process DB (Write Lock)
function processDB(callable $callback)
{
    $path = getDBPath();
    $defaultDB = ["users" => [], "date_selections" => [], "vote_blocks" => []];

    $fp = @fopen($path, 'c+'); // Suppress warning
    if (!$fp) {
        http_response_code(500);
        echo json_encode(["error" => "Database IO error"]);
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