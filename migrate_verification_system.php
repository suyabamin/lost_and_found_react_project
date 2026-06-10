<?php
/**
 * Database migration for Claim Ownership Verification System
 */

require_once __DIR__ . '/backend/src/core/Database.php';
require_once __DIR__ . '/backend/src/bootstrap.php'; // Load config if needed

$db = Database::connection();

try {
    echo "Starting migration...\n";

    // 1. Create claim_questions table
    $db->exec("
        CREATE TABLE IF NOT EXISTS claim_questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            item_id INT NOT NULL,
            question_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "Table 'claim_questions' created or already exists.\n";

    // 2. Create claim_answers table
    $db->exec("
        CREATE TABLE IF NOT EXISTS claim_answers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            claim_id INT NOT NULL,
            question_id INT NOT NULL,
            answer_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
            FOREIGN KEY (question_id) REFERENCES claim_questions(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "Table 'claim_answers' created or already exists.\n";

    echo "Migration completed successfully!\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
