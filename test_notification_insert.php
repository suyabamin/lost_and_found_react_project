<?php
define('CLI', true);
require_once __DIR__ . '/backend/src/bootstrap.php';

$userId = 7;
$title = "Test Title";
$message = "Test Message";
$type = "claim";
$refData = json_encode(['claim_id' => 14]);

try {
    $db = Database::connection();
    $stmt = $db->prepare('INSERT INTO notifications (user_id, title, message, type, reference_id, is_read) VALUES (?, ?, ?, ?, ?, 0)');
    $stmt->execute([$userId, $title, $message, $type, $refData]);
    echo "Success!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
