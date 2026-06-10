-- Migration for Claim Ownership Verification System
USE lost_found;

-- 1. Create claim_questions table
CREATE TABLE IF NOT EXISTS claim_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    question_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create claim_answers table
CREATE TABLE IF NOT EXISTS claim_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    claim_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES claim_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
