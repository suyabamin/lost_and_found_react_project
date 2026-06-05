<?php
require_once __DIR__ . '/backend/src/bootstrap.php';

try {
    $db = Database::connection();
    
    echo "Verifying users table...\n";
    
    // Check if role column exists
    $columns = $db->query("DESCRIBE users")->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('role', $columns)) {
        echo "Adding role column...\n";
        $db->exec("ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' AFTER email");
    } else {
        echo "Role column already exists.\n";
    }
    
    if (!in_array('status', $columns)) {
        echo "Adding status column...\n";
        $db->exec("ALTER TABLE users ADD COLUMN status ENUM('active', 'banned') DEFAULT 'active' AFTER role");
    } else {
        echo "Status column already exists.\n";
    }
    
    // Create admin account
    $adminEmail = 'admin@lostfound.com';
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$adminEmail]);
    if (!$stmt->fetch()) {
        echo "Creating default admin account...\n";
        $password = password_hash('Admin@123', PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute(['System Admin', $adminEmail, $password, 'admin', 'active']);
    } else {
        echo "Admin account already exists. Updating role to admin just in case.\n";
        $stmt = $db->prepare("UPDATE users SET role = 'admin' WHERE email = ?");
        $stmt->execute([$adminEmail]);
    }
    
    echo "Database migration complete!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
