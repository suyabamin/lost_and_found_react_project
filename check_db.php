<?php
require_once __DIR__ . '/backend/src/bootstrap.php';
$db = Database::connection();
$tables = ['users', 'items', 'ratings', 'claims', 'reports'];
foreach ($tables as $table) {
    try {
        $q = $db->query("DESCRIBE $table");
        echo "Table: $table\n";
        while ($r = $q->fetch()) {
            echo "  {$r['Field']} - {$r['Type']}\n";
        }
    } catch (Exception $e) {
        echo "Table $table error: " . $e->getMessage() . "\n";
    }
}
