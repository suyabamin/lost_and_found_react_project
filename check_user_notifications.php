<?php
require 'backend/src/bootstrap.php';
$db = Database::connection();
$userId = 6;
try {
    $stmt = $db->prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5');
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll();
    echo "NOTIFICATIONS FOR USER $userId:\n";
    print_r($notifications);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
