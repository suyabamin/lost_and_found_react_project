<?php
require_once __DIR__ . '/backend/src/bootstrap.php';
try {
    $stmt = Database::connection()->query("DESCRIBE users");
    foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        echo $row['Field'] . ": " . $row['Type'] . " | Null: " . $row['Null'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
