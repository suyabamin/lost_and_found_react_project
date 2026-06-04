<?php
$pdo = new PDO('mysql:host=localhost;dbname=lost_found', 'root', '');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

echo "=== RATINGS TABLE ===\n";
try {
    $s = $pdo->query('SELECT * FROM ratings');
    $rows = $s->fetchAll();
    echo count($rows) . " rows\n";
    foreach($rows as $r) echo json_encode($r) . "\n";
} catch(Exception $e) {
    echo 'ERROR: '.$e->getMessage() . "\n";
}

echo "\n=== REWARDS TABLE ===\n";
try {
    $s = $pdo->query('SELECT * FROM rewards');
    $rows = $s->fetchAll();
    echo count($rows) . " rows\n";
    foreach($rows as $r) echo json_encode($r) . "\n";
} catch(Exception $e) {
    echo 'ERROR: '.$e->getMessage() . "\n";
}

echo "\n=== USERS ===\n";
try {
    $s = $pdo->query('SELECT id, name, email, phone, bkash_number, nagad_number, rocket_number FROM users');
    $rows = $s->fetchAll();
    foreach($rows as $r) echo json_encode($r) . "\n";
} catch(Exception $e) {
    echo 'ERROR: '.$e->getMessage() . "\n";
}

echo "\n=== TRACKING SESSIONS ===\n";
try {
    $s = $pdo->query('SELECT * FROM tracking_sessions');
    $rows = $s->fetchAll();
    echo count($rows) . " rows\n";
    foreach($rows as $r) echo json_encode($r) . "\n";
} catch(Exception $e) {
    echo 'ERROR: '.$e->getMessage() . "\n";
}
