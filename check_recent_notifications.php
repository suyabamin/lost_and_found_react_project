<?php
require 'backend/src/bootstrap.php';
$db = Database::connection();
try {
    $stmt = $db->query('SELECT n.*, u.name as user_name FROM notifications n JOIN users u ON u.id = n.user_id ORDER BY n.created_at DESC LIMIT 10');
    echo "RECENT NOTIFICATIONS:\n";
    foreach ($stmt->fetchAll() as $row) {
        echo "ID: {$row['id']} | User: {$row['user_name']} (ID: {$row['user_id']}) | Title: {$row['title']} | Type: {$row['type']}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
