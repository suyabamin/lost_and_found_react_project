<?php
require 'backend/src/bootstrap.php';
$db = Database::connection();
try {
    $stmt = $db->query('SELECT c.*, u1.name as req_name, u2.name as own_name FROM conversations c JOIN users u1 ON u1.id = c.requester_id JOIN users u2 ON u2.id = c.owner_id LIMIT 10');
    echo "CONVERSATIONS:\n";
    foreach ($stmt->fetchAll() as $row) {
        echo "ID: {$row['id']} | Req: {$row['req_name']} ({$row['requester_id']}) | Own: {$row['own_name']} ({$row['owner_id']}) | Item: {$row['item_id']}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
