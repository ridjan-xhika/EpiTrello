const pool = require('../config/database');

class AuditLog {
  /**
   * Log an action in the organization audit log
   * @param {number} organizationId 
   * @param {number} userId 
   * @param {string} actionType - e.g., 'board_created', 'card_updated', 'member_added'
   * @param {string} entityType - e.g., 'board', 'card', 'member'
   * @param {number} entityId - ID of the affected entity
   * @param {object} actionDetails - Additional details as JSON
   * @param {string} ipAddress - User's IP address
   */
  static async logAction(organizationId, userId, actionType, entityType, entityId = null, actionDetails = null, ipAddress = null) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO organization_audit_log 
        (organization_id, user_id, action_type, entity_type, entity_id, action_details, ip_address) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [organizationId, userId, actionType, entityType, entityId, actionDetails ? JSON.stringify(actionDetails) : null, ipAddress]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error logging audit action:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for an organization
   * @param {number} organizationId 
   * @param {number} limit 
   * @param {number} offset 
   */
  static async getOrganizationLogs(organizationId, limit = 50, offset = 0) {
    try {
      const [logs] = await pool.execute(
        `SELECT 
          al.id,
          al.action_type,
          al.entity_type,
          al.entity_id,
          al.action_details,
          al.ip_address,
          al.created_at,
          u.id as user_id,
          u.username,
          u.name as user_name,
          u.email as user_email
        FROM organization_audit_log al
        JOIN users u ON al.user_id = u.id
        WHERE al.organization_id = ?
        ORDER BY al.created_at DESC
        LIMIT ? OFFSET ?`,
        [organizationId, limit, offset]
      );
      
      // Parse JSON action_details
      return logs.map(log => ({
        ...log,
        action_details: log.action_details ? JSON.parse(log.action_details) : null
      }));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit log count for an organization
   * @param {number} organizationId 
   */
  static async getOrganizationLogCount(organizationId) {
    try {
      const [rows] = await pool.execute(
        `SELECT COUNT(*) as count FROM organization_audit_log WHERE organization_id = ?`,
        [organizationId]
      );
      return rows[0].count;
    } catch (error) {
      console.error('Error fetching audit log count:', error);
      throw error;
    }
  }

  /**
   * Get audit logs filtered by action type
   * @param {number} organizationId 
   * @param {string} actionType 
   * @param {number} limit 
   * @param {number} offset 
   */
  static async getLogsByActionType(organizationId, actionType, limit = 50, offset = 0) {
    try {
      const [logs] = await pool.execute(
        `SELECT 
          al.id,
          al.action_type,
          al.entity_type,
          al.entity_id,
          al.action_details,
          al.ip_address,
          al.created_at,
          u.id as user_id,
          u.username,
          u.name as user_name,
          u.email as user_email
        FROM organization_audit_log al
        JOIN users u ON al.user_id = u.id
        WHERE al.organization_id = ? AND al.action_type = ?
        ORDER BY al.created_at DESC
        LIMIT ? OFFSET ?`,
        [organizationId, actionType, limit, offset]
      );
      
      return logs.map(log => ({
        ...log,
        action_details: log.action_details ? JSON.parse(log.action_details) : null
      }));
    } catch (error) {
      console.error('Error fetching filtered audit logs:', error);
      throw error;
    }
  }
}

module.exports = AuditLog;
