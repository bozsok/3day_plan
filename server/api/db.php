<?php
// CORS beállítások
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// JSON Adatbázis Fájl
$dbPath = __DIR__ . '/../data/db.json';
$dbDir = dirname($dbPath);

// Mappa létrehozása
if (!is_dir($dbDir)) {
    mkdir($dbDir, 0777, true);
}

// Segédfüggvény: JSON input olvasása
function getJsonInput()
{
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}

// Segédfüggvény: Adatbázis betöltése
// Segédfüggvény: Adatbázis atomi módosítása (Read-Modify-Write Lock-kal)
function processDB(callable $callback)
{
    global $dbPath;

    // Alapértelmezett adatbázis struktúra
    $defaultDB = [
        "users" => [],
        "date_selections" => [],
        "vote_blocks" => []
    ];

    // Fájl megnyitása olvasásra és írásra (c+ = létrehozza ha nincs, pointer az elején)
    $fp = fopen($dbPath, 'c+');
    if (!$fp) {
        http_response_code(500);
        echo json_encode(["error" => "Nem sikerült megnyitni az adatbázist."]);
        exit;
    }

    // Exkluzív zár kérése (blokkol amíg meg nem kapja)
    if (flock($fp, LOCK_EX)) {
        // 1. Olvasás
        $json = stream_get_contents($fp);
        $db = !empty($json) ? json_decode($json, true) : $defaultDB;
        if (!is_array($db))
            $db = $defaultDB;

        // 2. Módosítás (Callback hívása)
        try {
            $result = $callback($db); // A callback visszatérési értéke a válasz adattartalma (nem a DB!)
            // A callback referencia szerint módosítja a $db-t, vagy visszaadja a módosítottat?
            // PHP-ben objektum referencia, tömb nem.
            // Ezért a callback így nézzen ki: function(&$db) { ... return $bizniszLogikaEredmeny; }
        } catch (Exception $e) {
            // Hiba esetén visszaállítjuk a fájlt (nem írunk) és eldobjuk a hibát
            flock($fp, LOCK_UN);
            fclose($fp);
            throw $e;
        }

        // 3. Írás (Csak ha a callback sikeresen lefutott)
        ftruncate($fp, 0); // Fájl ürítése
        rewind($fp); // Pointer az elejére
        fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp); // Buffer ürítése

        // 4. Zár feloldása
        flock($fp, LOCK_UN);
        fclose($fp);

        return $result; // Visszaadjuk a logikai eredményt (pl. az új user adatait)

    } else {
        fclose($fp);
        http_response_code(503);
        echo json_encode(["error" => "Az adatbázis jelenleg foglalt, kérlek próbáld újra."]);
        exit;
    }
}

// Segédfüggvény: Adatbázis olvasása (Shared Lock)
function readDB()
{
    global $dbPath;
    $defaultDB = ["users" => [], "date_selections" => [], "votes" => []];

    if (!file_exists($dbPath))
        return $defaultDB;

    $fp = fopen($dbPath, 'r');
    if (flock($fp, LOCK_SH)) { // Megosztott zár (többen olvashatják egyszerre, de írni nem lehet)
        $json = stream_get_contents($fp);
        flock($fp, LOCK_UN);
        fclose($fp);
        return !empty($json) ? json_decode($json, true) : $defaultDB;
    } else {
        fclose($fp);
        return $defaultDB; // Fallback
    }
}

// Segédfüggvény: Új ID generálása
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
?>