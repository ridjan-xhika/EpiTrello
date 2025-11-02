-- Add organization audit log table
USE trello_mvp;

CREATE TABLE IF NOT EXISTS organization_audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  user_id INT NOT NULL,
  action_type VARCHAR(100) NOT NULL COMMENT 'board_created, card_updated, member_added, etc.',
  entity_type VARCHAR(50) NOT NULL COMMENT 'board, card, member, etc.',
  entity_id INT NULL COMMENT 'ID of the affected entity',
  action_details JSON NULL COMMENT 'Additional details about the action',
  ip_address VARCHAR(45) NULL COMMENT 'User IP address',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_organization_id (organization_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_action_type (action_type),
  INDEX idx_entity_type (entity_type)
);
