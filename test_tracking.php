<?php
require_once __DIR__ . '/backend/src/core/Database.php';
require_once __DIR__ . '/backend/src/core/Response.php';

// Mock session
$_SESSION['user_id'] = 9; // Owner of item 11

$params = ['id' => 11];

// This is a stripped down version of ItemController::show logic
$db = Database::connection();
$stmt = $db->prepare('SELECT id, user_id FROM items WHERE id = ?');
$stmt->execute([$params['id']]);
$item = $stmt->fetch();

$trackingStmt = $db->prepare(
    'SELECT id FROM tracking_sessions 
     WHERE item_id = ? AND status = "active" 
     AND (owner_id = ? OR claimant_id = ?)'
);
$trackingStmt->execute([$params['id'], 9, 9]);
$tracking = $trackingStmt->fetch();

echo "Item: " . json_encode($item) . "\n";
echo "Tracking: " . json_encode($tracking) . "\n";
