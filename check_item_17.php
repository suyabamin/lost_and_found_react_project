<?php
define('CLI', true);
require_once __DIR__ . '/backend/src/bootstrap.php';
$item = Database::connection()->query("SELECT id, user_id, title FROM items WHERE id = 17")->fetch(PDO::FETCH_ASSOC);
echo json_encode($item, JSON_PRETTY_PRINT);
