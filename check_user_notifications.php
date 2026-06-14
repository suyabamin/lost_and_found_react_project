<?php
define('CLI', true);
require_once __DIR__ . '/backend/src/bootstrap.php';

$db = Database::connection();
// Fetch latest notifications for a specific user to see if claims are there
// Let's find a user who has items
$item = $db->query("SELECT user_id FROM items LIMIT 1")->fetch();
if ($item) {
    $userId = $item['user_id'];
    $stmt = $db->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10");
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Notifications for User $userId:\n";
    echo json_encode($rows, JSON_PRETTY_PRINT);
} else {
    echo "No items found.";
}
