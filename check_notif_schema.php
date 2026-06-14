<?php
define('CLI', true);
require_once __DIR__ . '/backend/src/bootstrap.php';
$cols = Database::connection()->query("DESCRIBE notifications")->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($cols, JSON_PRETTY_PRINT);
