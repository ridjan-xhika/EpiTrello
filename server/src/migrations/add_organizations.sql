-- Migration: Add Organizations Support
-- Run this on your existing trello_mvp database

USE trello_mvp;

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

-- Add organization_id column to boards table
ALTER TABLE boards 
ADD COLUMN organization_id INT NULL AFTER user_id,
ADD FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
ADD INDEX idx_organization_id (organization_id);
