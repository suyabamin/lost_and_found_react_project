<?php
require_once __DIR__ . '/backend/src/bootstrap.php';
function printTable($name) {
    echo "Table: $name\n";
    $stmt = Database::connection()->query("DESCRIBE $name");
    foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        printf("  %-15s %-20s %-5s %-5s %-10s\n", $row['Field'], $row['Type'], $row['Null'], $row['Key'], $row['Default']);
    }
}
printTable('users');
printTable('items');
