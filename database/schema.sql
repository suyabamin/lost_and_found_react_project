-- ===========================================================
--  Lost & Found — Complete Database Schema (All-in-One)
--  Includes: core tables, ratings, rewards, history,
--            notifications, tracking, and all v2/v3 changes
-- ===========================================================
CREATE DATABASE IF NOT EXISTS lost_found CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lost_found;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS history;
DROP TABLE IF EXISTS rewards;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS tracking_sessions;
DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------
-- USERS
-- -----------------------------------------------------------
CREATE TABLE users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(120)  NOT NULL,
  email           VARCHAR(160)  NOT NULL UNIQUE,
  phone           VARCHAR(40)   NULL,
  password        VARCHAR(255)  NOT NULL,
  role            ENUM('user','admin') NOT NULL DEFAULT 'user',
  avatar          VARCHAR(500)  NULL,
  bio             TEXT          NULL,
  location        VARCHAR(255)  NULL,
  bkash_number    VARCHAR(20)   NULL,
  nagad_number    VARCHAR(20)   NULL,
  rocket_number   VARCHAR(20)   NULL,
  current_lat     DECIMAL(10, 8) NULL,
  current_lng     DECIMAL(11, 8) NULL,
  status          ENUM('active','banned','suspended') NOT NULL DEFAULT 'active',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------
-- CATEGORIES
-- -----------------------------------------------------------
CREATE TABLE categories (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  icon VARCHAR(80) NULL
);

-- -----------------------------------------------------------
-- ITEMS
-- -----------------------------------------------------------
CREATE TABLE items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  title        VARCHAR(180)  NOT NULL,
  description  TEXT          NOT NULL,
  category     VARCHAR(80)   NOT NULL,
  status       ENUM('lost','found','processing','resolved') NOT NULL DEFAULT 'lost',
  location     VARCHAR(255)  NOT NULL,
  full_address TEXT          NULL,
  latitude     DECIMAL(10, 8) NULL,
  longitude    DECIMAL(11, 8) NULL,
  item_date    DATE          NULL,
  contact      VARCHAR(120)  NULL,
  image_url    VARCHAR(500)  NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------
-- CONVERSATIONS
-- item_id is nullable (SET NULL) so chats survive item deletion.
-- item_title is a snapshot stored before deletion.
-- -----------------------------------------------------------
CREATE TABLE conversations (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  item_id      INT           NULL,
  item_title   VARCHAR(255)  NULL,
  requester_id INT NOT NULL,
  owner_id     INT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_conversation (item_id, requester_id, owner_id),
  FOREIGN KEY (item_id)      REFERENCES items(id) ON DELETE SET NULL,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id)     REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------
-- MESSAGES
-- -----------------------------------------------------------
CREATE TABLE messages (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id       INT NOT NULL,
  body            TEXT NOT NULL,
  attachment_url  VARCHAR(500) NULL,
  is_read         TINYINT(1)   NOT NULL DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id)       REFERENCES users(id)         ON DELETE CASCADE
);

-- -----------------------------------------------------------
-- FAVORITES
-- -----------------------------------------------------------
CREATE TABLE favorites (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  item_id    INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id)  ON DELETE CASCADE
);

-- -----------------------------------------------------------
-- CLAIMS
-- -----------------------------------------------------------
CREATE TABLE claims (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  item_id           INT NOT NULL,
  claimant_id       INT NOT NULL,
  reason            TEXT NOT NULL,
  proof_description TEXT NOT NULL,
  proof_image       VARCHAR(500) NULL,
  contact_info      VARCHAR(255) NULL,
  status            ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id)     REFERENCES items(id)  ON DELETE CASCADE,
  FOREIGN KEY (claimant_id) REFERENCES users(id)  ON DELETE CASCADE
);

-- -----------------------------------------------------------
-- REPORTS
-- -----------------------------------------------------------
CREATE TABLE reports (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  item_id    INT NOT NULL,
  user_id    INT NOT NULL,
  reason     VARCHAR(120) NOT NULL,
  details    TEXT NULL,
  status     ENUM('pending','reviewed','dismissed','action_taken') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id)  ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE
);

-- -----------------------------------------------------------
-- TRACKING SESSIONS
-- -----------------------------------------------------------
CREATE TABLE tracking_sessions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  item_id     INT NOT NULL,
  owner_id    INT NOT NULL,
  claimant_id INT NOT NULL,
  status      ENUM('active','completed','cancelled') NOT NULL DEFAULT 'active',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id)     REFERENCES items(id)  ON DELETE CASCADE,
  FOREIGN KEY (owner_id)    REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (claimant_id) REFERENCES users(id)  ON DELETE CASCADE
);

-- -----------------------------------------------------------
-- NOTIFICATIONS
-- -----------------------------------------------------------
CREATE TABLE notifications (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  title        VARCHAR(160) NOT NULL,
  message      TEXT NOT NULL,
  type         ENUM('message','claim','claim_approved','claim_rejected','match','system','favorite','tracking','reward','rating','return','admin_alert') NOT NULL DEFAULT 'system',
  reference_id VARCHAR(255) NULL,
  is_read      TINYINT(1)   NOT NULL DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------
-- RATINGS  (stored even after item is deleted)
-- -----------------------------------------------------------
CREATE TABLE ratings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  tracking_id INT NOT NULL,
  item_id     INT NULL,
  from_user_id INT NOT NULL,
  to_user_id  INT NOT NULL,
  rating      TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review      TEXT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tracking_id)   REFERENCES tracking_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id)       REFERENCES items(id)              ON DELETE SET NULL,
  FOREIGN KEY (from_user_id)  REFERENCES users(id)              ON DELETE CASCADE,
  FOREIGN KEY (to_user_id)    REFERENCES users(id)              ON DELETE CASCADE
);

-- -----------------------------------------------------------
-- REWARDS
-- -----------------------------------------------------------
CREATE TABLE rewards (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  tracking_id     INT NOT NULL,
  item_id         INT NULL,
  sender_id       INT NOT NULL,
  receiver_id     INT NOT NULL,
  payment_method  VARCHAR(80)  NOT NULL, -- bkash, nagad, rocket
  receiver_number VARCHAR(20)  NOT NULL,
  amount          DECIMAL(10, 2) NOT NULL,
  transaction_id  VARCHAR(120) NOT NULL,
  screenshot_url  VARCHAR(500) NULL,
  status          ENUM('pending','confirmed','rejected') NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tracking_id)  REFERENCES tracking_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id)    REFERENCES users(id)              ON DELETE CASCADE,
  FOREIGN KEY (receiver_id)  REFERENCES users(id)              ON DELETE CASCADE
);

-- -----------------------------------------------------------
-- HISTORY
-- item_id is nullable so rows survive item deletion.
-- item_title is a snapshot stored at time of return.
-- -----------------------------------------------------------
CREATE TABLE history (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  item_id     INT NULL,
  item_title  VARCHAR(255) NULL,
  action_type VARCHAR(100) NOT NULL,
  reference_id INT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===========================================================
-- SEED DATA
-- ===========================================================

INSERT INTO categories (name, icon) VALUES
  ('Electronics', 'FaLaptop'),
  ('Pets',        'FaPaw'),
  ('Documents',   'FaFileAlt'),
  ('Bags',        'FaBagShopping'),
  ('Keys',        'FaKey'),
  ('Jewelry',     'FaGem'),
  ('Others',      'FaBox')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (id, name, email, phone, password, role, bkash_number, nagad_number, rocket_number) VALUES
  (1, 'Admin User',   'admin@lostfound.test',  '+8801700000001', '$2y$10$OuTYYPhx7JtexJ7LhZfWXuaudz7oNPBMhwlRttjqwktwGoiNZFrlg2', 'admin', '01700000001', '01700000001', '01700000001'),
  (2, 'Alex Morgan',  'alex@lostfound.test',   '+8801700000002', '$2y$10$OuTYYPhx7JtexJ7LhZfWXuaudz7oNPBMhwlRttjqwktwGoiNZFrlg2', 'user',  '01700000002', '01700000002', '01700000002'),
  (3, 'Nabila Khan',  'nabila@lostfound.test', '+8801700000003', '$2y$10$OuTYYPhx7JtexJ7LhZfWXuaudz7oNPBMhwlRttjqwktwGoiNZFrlg2', 'user',  '01700000003', '01700000003', '01700000003'),
  (4, 'Rakib Hasan',  'rakib@lostfound.test',  '+8801700000004', '$2y$10$OuTYYPhx7JtexJ7LhZfWXuaudz7oNPBMhwlRttjqwktwGoiNZFrlg2', 'user',  '01700000004', '01700000004', '01700000004')
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), role = VALUES(role), password = VALUES(password), 
                        bkash_number = VALUES(bkash_number), nagad_number = VALUES(nagad_number), rocket_number = VALUES(rocket_number);

INSERT INTO items (id, user_id, title, description, category, status, location, latitude, longitude, item_date, contact, image_url) VALUES
  (1, 2, 'Black iPhone 14 Pro',          'Found a black iPhone 14 Pro with a clear case near the Dhanmondi Lake walkway.',        'Electronics', 'found', 'Dhanmondi Lake, Dhaka',                   23.74650000, 90.37600000, '2026-05-21', 'alex@lostfound.test',   NULL),
  (2, 3, 'Brown Leather Wallet',          'Lost brown leather wallet containing student ID, bank cards, and a small family photo.', 'Bags',        'lost',  'Bashundhara City Shopping Complex, Dhaka', 23.75160000, 90.39060000, '2026-05-22', 'nabila@lostfound.test', NULL),
  (3, 4, 'Silver Key Set With Blue Tag',  'Found three silver keys attached to a blue plastic tag near Mirpur 10 bus stand.',      'Keys',        'found', 'Mirpur 10, Dhaka',                        23.80670000, 90.36860000, '2026-05-24', 'rakib@lostfound.test',  NULL),
  (4, 2, 'Lost University ID Card',       'Lost university ID card and library card inside a transparent card holder.',            'Documents',   'lost',  'Shahbag, Dhaka',                          23.73800000, 90.39540000, '2026-05-25', 'alex@lostfound.test',   NULL),
  (5, 3, 'Golden Retriever Puppy',        'Found a friendly golden retriever puppy wearing a red collar.',                         'Pets',        'found', 'Gulshan 2 Park, Dhaka',                   23.79460000, 90.41430000, '2026-05-26', 'nabila@lostfound.test', NULL),
  (6, 4, 'Samsung Galaxy Buds Case',      'Lost white Samsung Galaxy Buds case near the campus cafeteria.',                        'Electronics', 'lost',  'AIUB Campus, Kuratoli, Dhaka',            23.82230000, 90.42780000, '2026-05-27', 'rakib@lostfound.test',  NULL)
ON DUPLICATE KEY UPDATE title = VALUES(title), status = VALUES(status);

INSERT INTO conversations (id, item_id, requester_id, owner_id) VALUES
  (1, 1, 3, 2),
  (2, 2, 4, 3)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

INSERT INTO messages (conversation_id, sender_id, body) VALUES
  (1, 3, 'Hello, I think the iPhone may belong to my brother. Can I verify the lock screen?'),
  (1, 2, 'Yes, please share identifying details before we arrange pickup.'),
  (2, 4, 'I found a wallet near Bashundhara. Can you describe the ID card?');

INSERT INTO favorites (user_id, item_id) VALUES
  (2, 3), (3, 1), (4, 2)
ON DUPLICATE KEY UPDATE created_at = created_at;

INSERT INTO claims (item_id, claimant_id, reason, proof_description, status) VALUES
  (1, 3, 'I can identify the phone wallpaper and IMEI ending digits.', 'The screen saver is a sunset photo.', 'pending'),
  (3, 2, 'These keys look similar to my apartment key set.', 'The blue tag has a scratch mark I can identify.', 'pending');

INSERT INTO reports (item_id, user_id, reason, details, status) VALUES
  (2, 2, 'Fake Post', 'The same wallet photo appeared in another listing with a different location.', 'pending');

INSERT INTO notifications (user_id, title, message, type) VALUES
  (2, 'New Claim Request', 'Nabila Khan submitted a claim for "Black iPhone 14 Pro".', 'claim'),
  (3, 'Post Published',    'Your post "Brown Leather Wallet" is now live.',             'system'),
  (4, 'New Message',       'Alex Morgan wants to discuss "Silver Key Set" with you.',   'message');
