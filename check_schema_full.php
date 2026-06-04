<?php
require_once __DIR__ . '/backend/src/bootstrap.php';
$db = Database::connection();
foreach (['users', 'items'] as $table) {
    echo "Table: $table\n";
    $stmt = $db->query("DESCRIBE $table");
    foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        echo "  " . $row['Field'] . " (" . $row['Type'] . ")\n";
    }
}
