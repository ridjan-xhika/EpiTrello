const pool = require('../config/database');

class OrganizationMember {
  static async addMember(organizationId, userId, role = 'member') {
    const [result] = await pool.execute(
      'INSERT INTO organization_members (organization_id, user_id, role) VALUES (?, ?, ?)',
      [organizationId, userId, role]
    );
    return result.insertId;
  }

  static async getMemberRole(organizationId, userId) {
    const [rows] = await pool.execute(
      'SELECT role FROM organization_members WHERE organization_id = ? AND user_id = ?',
      [organizationId, userId]
    );
    return rows[0]?.role || null;
  }

  static async getMembers(organizationId) {
    const [rows] = await pool.execute(
      `SELECT om.*, u.name, u.username, u.email, u.bio
       FROM organization_members om
       JOIN users u ON om.user_id = u.id
       WHERE om.organization_id = ?
       ORDER BY 
         CASE om.role
           WHEN 'owner' THEN 1
           WHEN 'admin' THEN 2
           WHEN 'member' THEN 3
         END,
         om.created_at ASC`,
      [organizationId]
    );
    return rows;
  }

  static async updateRole(organizationId, userId, role) {
    await pool.execute(
      'UPDATE organization_members SET role = ? WHERE organization_id = ? AND user_id = ?',
      [role, organizationId, userId]
    );
  }

  static async removeMember(organizationId, userId) {
    await pool.execute(
      'DELETE FROM organization_members WHERE organization_id = ? AND user_id = ?',
      [organizationId, userId]
    );
  }

  static async isMember(organizationId, userId) {
    const role = await this.getMemberRole(organizationId, userId);
    return role !== null;
  }

  static async isAdmin(organizationId, userId) {
    const role = await this.getMemberRole(organizationId, userId);
    return role === 'admin' || role === 'owner';
  }

  static async isOwner(organizationId, userId) {
    const role = await this.getMemberRole(organizationId, userId);
    return role === 'owner';
  }
}

module.exports = OrganizationMember;
