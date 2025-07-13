<?php
// Konfigurasi database MySQL
$host = 'localhost';
$dbname = 'msyncmyi_testy';
$username = 'msyncmyi_testy';
$password = '#Sf=iG&whql_0RXw';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Koneksi database gagal: " . $e->getMessage());
}

// Password admin
define('ADMIN_PASSWORD', 'maungapain');
?>
