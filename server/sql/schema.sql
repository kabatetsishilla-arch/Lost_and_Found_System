CREATE DATABASE IF NOT EXISTS ucu_lost_found CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ucu_lost_found;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','admin') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS auth_sessions (
  id CHAR(64) PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_session_expiry (expires_at)
);
CREATE TABLE IF NOT EXISTS reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reporter_id BIGINT UNSIGNED NOT NULL,
  kind ENUM('lost','found') NOT NULL,
  title VARCHAR(120) NOT NULL,
  category VARCHAR(60) NOT NULL,
  description VARCHAR(1200) NOT NULL,
  identifying_details VARCHAR(1200) NULL,
  item_date DATE NOT NULL,
  location VARCHAR(120) NOT NULL,
  photo_url VARCHAR(500) NULL,
  status ENUM('open','returned') NOT NULL DEFAULT 'open',
  returned_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_report_user FOREIGN KEY (reporter_id) REFERENCES users(id),
  INDEX idx_report_search (status,kind,category,location,item_date)
);
CREATE TABLE IF NOT EXISTS claims (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_id BIGINT UNSIGNED NOT NULL,
  claimant_id BIGINT UNSIGNED NOT NULL,
  evidence VARCHAR(1200) NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  admin_response VARCHAR(1200) NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  reviewed_at DATETIME NULL,
  collected_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_claim_report FOREIGN KEY (report_id) REFERENCES reports(id),
  CONSTRAINT fk_claimant FOREIGN KEY (claimant_id) REFERENCES users(id),
  CONSTRAINT fk_claim_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id),
  INDEX idx_claim_report_status (report_id,status),
  INDEX idx_claimant (claimant_id)
);
