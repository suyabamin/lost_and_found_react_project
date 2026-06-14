<?php
define('CLI', true);
require_once __DIR__ . '/backend/src/bootstrap.php';
$db = Database::connection();
$notifs = $db->query("SELECT n.*, u.name as user_name FROM notifications n JOIN users u ON u.id = n.user_id ORDER BY n.id DESC LIMIT 20")->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($notifs, JSON_PRETTY_PRINT);
