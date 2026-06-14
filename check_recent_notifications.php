<?php
define('CLI', true);
require_once __DIR__ . '/backend/src/bootstrap.php';

$db = Database::connection();
$stmt = $db->query("SELECT * FROM notifications WHERE type = 'claim' ORDER BY created_at DESC LIMIT 5");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows, JSON_PRETTY_PRINT);
