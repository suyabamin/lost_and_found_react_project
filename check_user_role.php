<?php
require 'backend/src/bootstrap.php';
$db = Database::connection();
try {
    $stmt = $db->query('SELECT id, name, role FROM users WHERE id = 6');
    print_r($stmt->fetch());
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
