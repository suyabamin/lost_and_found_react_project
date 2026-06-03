<?php
require_once __DIR__ . '/backend/src/bootstrap.php';
$db = Database::connection();

function addColumn($db, $table, $column, $definition) {
    $stmt = $db->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
    if (!$stmt->fetch()) {
        echo "Adding $column to $table...\n";
        $db->exec("ALTER TABLE `$table` ADD COLUMN `$column` $definition");
    }
}

try {
    // Check if claimant_id exists
    $stmt = $db->query("SHOW COLUMNS FROM claims LIKE 'user_id'");
    if ($stmt->fetch()) {
        echo "Renaming user_id to claimant_id...\n";
        $db->exec("ALTER TABLE claims CHANGE user_id claimant_id INT NOT NULL");
    }

    addColumn($db, 'claims', 'reason', 'TEXT NOT NULL AFTER claimant_id');
    addColumn($db, 'claims', 'proof_description', 'TEXT NOT NULL AFTER reason');
    addColumn($db, 'claims', 'proof_image', 'VARCHAR(500) NULL AFTER proof_description');
    addColumn($db, 'claims', 'contact_info', 'VARCHAR(255) NULL AFTER proof_image');
    
    $db->exec("ALTER TABLE claims MODIFY COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'");

    $stmt = $db->query("SHOW COLUMNS FROM notifications LIKE 'body'");
    if ($stmt->fetch()) {
        echo "Renaming body to message in notifications...\n";
        $db->exec("ALTER TABLE notifications CHANGE body message TEXT NOT NULL");
    }

    echo "Updating notifications type enum...\n";
    $db->exec("ALTER TABLE notifications MODIFY COLUMN type ENUM('message','claim','match','system','favorite') NOT NULL DEFAULT 'system'");

    echo "Database sync complete!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
