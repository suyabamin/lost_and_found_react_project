<?php
require 'backend/src/bootstrap.php';
$db = Database::connection();
try {
    $stmt = $db->query('DESCRIBE notifications');
    echo "TABLE: notifications\n";
    foreach ($stmt->fetchAll() as $row) {
        echo "  {$row['Field']} ({$row['Type']})\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
