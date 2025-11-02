-- Create database
CREATE DATABASE IF NOT EXISTS trello_mvp;
USE trello_mvp;

-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Organizations table
CREATE TABLE organizations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_created_by (created_by)
);

-- Organization members table
CREATE TABLE organization_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner', 'admin', 'member') DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_org_user (organization_id, user_id),
  INDEX idx_organization_id (organization_id),
  INDEX idx_user_id (user_id)
);

-- Organization invitations table
CREATE TABLE organization_invitations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  inviter_id INT NOT NULL,
  invitee_email VARCHAR(100) NOT NULL,
  role ENUM('admin', 'member') DEFAULT 'member',
  status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_organization_id (organization_id),
  INDEX idx_token (token),
  INDEX idx_invitee_email (invitee_email)
);

-- Boards table (modified to support organizations)
CREATE TABLE boards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  organization_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_organization_id (organization_id)
);

-- Board members table (for collaboration features)
CREATE TABLE board_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  board_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner', 'admin', 'write', 'read') DEFAULT 'read',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_board_user (board_id, user_id),
  INDEX idx_board_id (board_id),
  INDEX idx_user_id (user_id)
);

-- Board invitations table
CREATE TABLE board_invitations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  board_id INT NOT NULL,
  inviter_id INT NOT NULL,
  invitee_email VARCHAR(100) NOT NULL,
  role ENUM('admin', 'write', 'read') DEFAULT 'read',
  status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
  FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_board_id (board_id),
  INDEX idx_token (token),
  INDEX idx_invitee_email (invitee_email)
);

-- Columns table
CREATE TABLE columns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  board_id INT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
  INDEX idx_board_id (board_id),
  INDEX idx_position (position)
);

-- Cards table
CREATE TABLE cards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  column_id INT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  due_date DATETIME NULL,
  start_date DATETIME NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at DATETIME NULL,
  time_estimate INT NULL COMMENT 'Estimated time in hours',
  time_spent INT NULL COMMENT 'Time spent in hours',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  cover_color VARCHAR(7) NULL COMMENT 'Hex color for card cover',
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_column_id (column_id),
  INDEX idx_position (position),
  INDEX idx_due_date (due_date),
  INDEX idx_priority (priority)
);

-- Card labels
CREATE TABLE card_labels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  card_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL COMMENT 'Hex color',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id)
);

-- Card checklists
CREATE TABLE card_checklists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  card_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id)
);

-- Checklist items
CREATE TABLE checklist_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  checklist_id INT NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  position INT DEFAULT 0,
  due_date DATETIME NULL,
  assigned_to INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (checklist_id) REFERENCES card_checklists(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_checklist_id (checklist_id)
);

-- Card attachments
CREATE TABLE card_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  card_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NULL,
  file_size INT NULL COMMENT 'Size in bytes',
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id)
);

-- Card comments
CREATE TABLE card_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  card_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id),
  INDEX idx_user_id (user_id)
);

-- Card members (assigned users)
CREATE TABLE card_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  card_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_card_user (card_id, user_id),
  INDEX idx_card_id (card_id),
  INDEX idx_user_id (user_id)
);

-- Card activity log
CREATE TABLE card_activity (
  id INT PRIMARY KEY AUTO_INCREMENT,
  card_id INT NOT NULL,
  user_id INT NOT NULL,
  action_type VARCHAR(50) NOT NULL COMMENT 'created, moved, commented, etc.',
  action_data JSON NULL COMMENT 'Additional action details',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id),
  INDEX idx_created_at (created_at)
);

-- Lists table
CREATE TABLE lists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- Insert default users
INSERT INTO users (username, email, password, name) VALUES
('admin', 'admin@example.com', '$2b$10$rZ9GlFqH5vX6qYZKz3ZqOe7HJ5LGvQlZxR7pGlFqH5vX6qYZKz3ZqO', 'Admin User'),
('user', 'user@example.com', '$2b$10$rZ9GlFqH5vX6qYZKz3ZqOe7HJ5LGvQlZxR7pGlFqH5vX6qYZKz3ZqO', 'Regular User');
-- Note: Password is 'admin123' and 'user123' hashed with bcrypt

-- ============================================
-- MIGRATION: Add Organizations Support
-- Run this section if upgrading existing database
-- ============================================

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_created_by (created_by)
);

-- Create organization members table
CREATE TABLE IF NOT EXISTS organization_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner', 'admin', 'member') DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_org_user (organization_id, user_id),
  INDEX idx_organization_id (organization_id),
  INDEX idx_user_id (user_id)
);

-- Create organization invitations table
CREATE TABLE IF NOT EXISTS organization_invitations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  inviter_id INT NOT NULL,
  invitee_email VARCHAR(100) NOT NULL,
  role ENUM('admin', 'member') DEFAULT 'member',
  status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_organization_id (organization_id),
  INDEX idx_token (token),
  INDEX idx_invitee_email (invitee_email)
);

-- Add organization_id column to boards table if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = "boards";
SET @columnname = "organization_id";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " INT NULL AFTER user_id, ADD FOREIGN KEY (", @columnname, ") REFERENCES organizations(id) ON DELETE CASCADE, ADD INDEX idx_", @columnname, " (", @columnname, ")")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- MIGRATION: Add Advanced Card Features
-- Run this section to add Trello-like features
-- ============================================

-- Add due_date column
SET @dbname = DATABASE();
SET @tablename = "cards";
SET @columnname = "due_date";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  "ALTER TABLE cards ADD COLUMN due_date DATETIME NULL AFTER position"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add start_date column
SET @columnname = "start_date";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  "ALTER TABLE cards ADD COLUMN start_date DATETIME NULL AFTER due_date"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add completed column
SET @columnname = "completed";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  "ALTER TABLE cards ADD COLUMN completed BOOLEAN DEFAULT FALSE AFTER start_date"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add completed_at column
SET @columnname = "completed_at";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  "ALTER TABLE cards ADD COLUMN completed_at DATETIME NULL AFTER completed"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add time_estimate column
SET @columnname = "time_estimate";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  "ALTER TABLE cards ADD COLUMN time_estimate INT NULL COMMENT 'Estimated time in minutes' AFTER completed_at"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add time_spent column
SET @columnname = "time_spent";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  "ALTER TABLE cards ADD COLUMN time_spent INT NULL COMMENT 'Time spent in minutes' AFTER time_estimate"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add priority column
SET @columnname = "priority";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  "ALTER TABLE cards ADD COLUMN priority ENUM('low', 'medium', 'high', 'critical') DEFAULT NULL AFTER time_spent"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add cover_color column
SET @columnname = "cover_color";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  "ALTER TABLE cards ADD COLUMN cover_color VARCHAR(7) NULL COMMENT 'Hex color for card cover' AFTER priority"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add created_by column
SET @columnname = "created_by";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  "SELECT 1",
  "ALTER TABLE cards ADD COLUMN created_by INT NULL AFTER cover_color"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index for due_date
SET @dbname = DATABASE();
SET @tablename = "cards";
SET @indexname = "idx_due_date";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (index_name = @indexname)) > 0,
  "SELECT 1",
  "ALTER TABLE cards ADD INDEX idx_due_date (due_date)"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index for priority
SET @indexname = "idx_priority";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (index_name = @indexname)) > 0,
  "SELECT 1",
  "ALTER TABLE cards ADD INDEX idx_priority (priority)"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add foreign key for created_by if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = "cards";
SET @fkname = "fk_cards_created_by";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      (constraint_name = @fkname)
      AND (table_schema = @dbname)
      AND (table_name = @tablename)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE cards ADD CONSTRAINT fk_cards_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================================================
-- MIGRATION SQL FOR EXISTING DATABASES
-- Run this section in phpMyAdmin if you already have the trello_mvp database
-- ============================================================================

-- Create card labels table
CREATE TABLE IF NOT EXISTS card_labels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  card_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL COMMENT 'Hex color',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id)
);

-- Create card checklists table
CREATE TABLE IF NOT EXISTS card_checklists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  card_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id)
);

-- Create checklist items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  checklist_id INT NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  position INT DEFAULT 0,
  due_date DATETIME NULL,
  assigned_to INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (checklist_id) REFERENCES card_checklists(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_checklist_id (checklist_id)
);

-- Create card attachments table
CREATE TABLE IF NOT EXISTS card_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  card_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NULL,
  file_size INT NULL COMMENT 'Size in bytes',
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id)
);

-- Create card comments table
CREATE TABLE IF NOT EXISTS card_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  card_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id),
  INDEX idx_user_id (user_id)
);

-- Create card members table
CREATE TABLE IF NOT EXISTS card_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  card_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_card_user (card_id, user_id),
  INDEX idx_card_id (card_id),
  INDEX idx_user_id (user_id)
);

-- Create card activity table
CREATE TABLE IF NOT EXISTS card_activity (
  id INT PRIMARY KEY AUTO_INCREMENT,
  card_id INT NOT NULL,
  user_id INT NOT NULL,
  action_type VARCHAR(50) NOT NULL COMMENT 'created, moved, commented, etc.',
  action_data JSON NULL COMMENT 'Additional action details',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id),
  INDEX idx_created_at (created_at)
);
