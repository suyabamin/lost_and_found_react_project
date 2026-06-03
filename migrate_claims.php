<?php
$db = new PDO('mysql:host=127.0.0.1;dbname=lost_found', 'root', '');
try {
    $db->exec("ALTER TABLE claims ADD COLUMN reason TEXT NULL AFTER user_id");
    $db->exec("ALTER TABLE claims ADD COLUMN proof_description TEXT NULL AFTER reason");
    $db->exec("ALTER TABLE claims ADD COLUMN proof_image VARCHAR(500) NULL AFTER proof_description");
    $db->exec("ALTER TABLE claims ADD COLUMN contact_info VARCHAR(255) NULL AFTER proof_image");
    echo "Claims table updated successfully.\n";
} catch (Exception $e) {
    echo "Update failed: " . $e->getMessage() . "\n";
}
