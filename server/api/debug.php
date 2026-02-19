<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: text/html; charset=UTF-8");

echo "<h2>PHP Final Debug (v3)</h2>";
echo "<b>PHP verzió:</b> " . PHP_VERSION . "<br>";

$dbFile = __DIR__ . '/../data/db.json';
echo "<h3>Adatbázis ellenőrzés:</h3>";
echo "Fájl: $dbFile <br>";
if (file_exists($dbFile)) {
    echo "Létezik: IGEN<br>";
    $json = file_get_contents($dbFile);
    $data = json_decode($json, true);
    if ($data === null) {
        echo "JSON hiba: " . json_last_error_msg() . "<br>";
        echo "Nyers tartalom eleje: " . htmlspecialchars(substr($json, 0, 50)) . "...<br>";
    } else {
        echo "JSON érvényes: IGEN<br>";
        echo "Felhasználók száma: " . (isset($data['users']) ? count($data['users']) : "HIÁNYZIK") . "<br>";
    }
} else {
    echo "Létezik: NEM (Ez normális, ha még nem volt mentés)<br>";
}

echo "<h3>PHP Modulok:</h3>";
$needed = ['json', 'openssl', 'mbstring', 'hash'];
foreach ($needed as $m) {
    echo "Modul '$m': " . (extension_loaded($m) ? "BETÖLTVE" : "HIÁNYZIK!!!") . "<br>";
}

echo "<h3>Users.php teszt (GET):</h3>";
$url = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . "/users.php?userId=1";
echo "Teszt URL: <a href='$url'>$url</a><br>";

echo "<br><b>DEBUG VÉGE</b>";
?>