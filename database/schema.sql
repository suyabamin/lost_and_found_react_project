CREATE DATABASE IF NOT EXISTS lost_found CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lost_found;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(40) NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  avatar VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  icon VARCHAR(80) NULL
);

CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  status ENUM('lost','found','resolved') NOT NULL DEFAULT 'lost',
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  item_date DATE NULL,
  contact VARCHAR(120) NULL,
  image_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  requester_id INT NOT NULL,
  owner_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_conversation (item_id, requester_id, owner_id),
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  body TEXT NOT NULL,
  attachment_url VARCHAR(500) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  claimant_id INT NOT NULL,
  reason TEXT NOT NULL,
  proof_description TEXT NOT NULL,
  proof_image VARCHAR(500) NULL,
  contact_info VARCHAR(255) NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (claimant_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  user_id INT NOT NULL,
  reason VARCHAR(120) NOT NULL,
  details TEXT NULL,
  status ENUM('pending','reviewed','dismissed','action_taken') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('message','claim','match','system','favorite') NOT NULL DEFAULT 'system',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO categories (name, icon) VALUES
('Electronics', 'FaLaptop'),
('Pets', 'FaPaw'),
('Documents', 'FaFileAlt'),
('Bags', 'FaBagShopping'),
('Keys', 'FaKey'),
('Jewelry', 'FaGem'),
('Others', 'FaBox')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (id, name, email, phone, password, role) VALUES
(1, 'Admin User', 'admin@lostfound.test', '+8801700000001', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
(2, 'Alex Morgan', 'alex@lostfound.test', '+8801700000002', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
(3, 'Nabila Khan', 'nabila@lostfound.test', '+8801700000003', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
(4, 'Rakib Hasan', 'rakib@lostfound.test', '+8801700000004', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), role = VALUES(role);

INSERT INTO items (id, user_id, title, description, category, status, location, latitude, longitude, item_date, contact, image_url) VALUES
(1, 2, 'Black iPhone 14 Pro', 'Found a black iPhone 14 Pro with a clear case near the Dhanmondi Lake walkway. The lock screen has a family photo.', 'Electronics', 'found', 'Dhanmondi Lake, Dhaka', 23.74650000, 90.37600000, '2026-05-21', 'alex@lostfound.test', NULL),
(2, 3, 'Brown Leather Wallet', 'Lost brown leather wallet containing student ID, bank cards, and a small family photo. Reward offered.', 'Bags', 'lost', 'Bashundhara City Shopping Complex, Dhaka', 23.75160000, 90.39060000, '2026-05-22', 'nabila@lostfound.test', NULL),
(3, 4, 'Silver Key Set With Blue Tag', 'Found three silver keys attached to a blue plastic tag near Mirpur 10 bus stand.', 'Keys', 'found', 'Mirpur 10, Dhaka', 23.80670000, 90.36860000, '2026-05-24', 'rakib@lostfound.test', NULL),
(4, 2, 'Lost University ID Card', 'Lost university ID card and library card inside a transparent card holder.', 'Documents', 'lost', 'Shahbag, Dhaka', 23.73800000, 90.39540000, '2026-05-25', 'alex@lostfound.test', NULL),
(5, 3, 'Golden Retriever Puppy', 'Found a friendly golden retriever puppy wearing a red collar. Waiting for owner verification.', 'Pets', 'found', 'Gulshan 2 Park, Dhaka', 23.79460000, 90.41430000, '2026-05-26', 'nabila@lostfound.test', NULL),
(6, 4, 'Samsung Galaxy Buds Case', 'Lost white Samsung Galaxy Buds case near the campus cafeteria.', 'Electronics', 'lost', 'AIUB Campus, Kuratoli, Dhaka', 23.82230000, 90.42780000, '2026-05-27', 'rakib@lostfound.test', NULL)
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), status = VALUES(status), location = VALUES(location);

INSERT INTO conversations (id, item_id, requester_id, owner_id) VALUES
(1, 1, 3, 2),
(2, 2, 4, 3)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

INSERT INTO messages (conversation_id, sender_id, body) VALUES
(1, 3, 'Hello, I think the iPhone may belong to my brother. Can I verify the lock screen?'),
(1, 2, 'Yes, please share identifying details before we arrange pickup.'),
(2, 4, 'I found a wallet near Bashundhara. Can you describe the ID card?');

INSERT INTO favorites (user_id, item_id) VALUES
(2, 3),
(3, 1),
(4, 2)
ON DUPLICATE KEY UPDATE created_at = created_at;

INSERT INTO claims (item_id, user_id, message, status) VALUES
(1, 3, 'I can identify the phone wallpaper and IMEI ending digits.', 'pending'),
(3, 2, 'These keys look similar to my apartment key set.', 'pending');

INSERT INTO reports (item_id, user_id, reason, details, status) VALUES
(2, 2, 'Fake Post', 'The same wallet photo appeared in another listing with different location.', 'pending');

INSERT INTO notifications (user_id, title, body, type) VALUES
(2, 'New Claim Request', 'Nabila Khan submitted a claim for "Black iPhone 14 Pro".', 'claim'),
(3, 'Post Published', 'Your post "Brown Leather Wallet" is now live.', 'system'),
(4, 'New Message', 'Alex Morgan wants to discuss "Silver Key Set" with you.', 'message');
