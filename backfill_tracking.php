<?php
require_once __DIR__ . '/backend/src/core/Database.php';

$db = Database::connection();
$count = $db->exec("
    INSERT INTO tracking_sessions (item_id, owner_id, claimant_id, status)
    SELECT c.item_id, i.user_id, c.claimant_id, 'active'
    FROM claims c
    JOIN items i ON i.id = c.item_id
    WHERE c.status = 'approved'
    AND NOT EXISTS (
        SELECT 1 FROM tracking_sessions ts 
        WHERE ts.item_id = c.item_id 
        AND ts.claimant_id = c.claimant_id
    )
");

echo "Successfully backfilled $count tracking sessions.\n";

$sessions = $db->query("SELECT * FROM tracking_sessions")->fetchAll();
echo "Current sessions in DB: " . count($sessions) . "\n";
print_r($sessions);
