<?php
define('CLI', true);
// Suppress headers by defining constants or just ignoring them if possible
// The bootstrap.php calls header(), which might warn in CLI but it's okay

require_once __DIR__ . '/backend/src/bootstrap.php';

$db = Database::connection();
$stmt = $db->query("DESCRIBE notifications");
$schema = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($schema, JSON_PRETTY_PRINT);
