const pool = require('../config/database');
const crypto = require('crypto');

class OrganizationInvitation {
  static async create(organizationId, inviterId, inviteeEmail, role = 'member') {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [result] = await pool.execute(
      `INSERT INTO organization_invitations 
       (organization_id, inviter_id, invitee_email, role, token, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [organizationId, inviterId, inviteeEmail, role, token, expiresAt]
    );
    
    return { id: result.insertId, token };
  }

  static async findByToken(token) {
    const [rows] = await pool.execute(
      `SELECT oi.*, o.name as organization_name, o.display_name as organization_display_name,
       u.name as inviter_name, u.username as inviter_username
       FROM organization_invitations oi
       JOIN organizations o ON oi.organization_id = o.id
       JOIN users u ON oi.inviter_id = u.id
       WHERE oi.token = ? AND oi.status = 'pending' AND oi.expires_at > NOW()`,
      [token]
    );
    return rows[0];
  }

  static async getByOrganization(organizationId) {
    const [rows] = await pool.execute(
      `SELECT oi.*, u.name as inviter_name, u.username as inviter_username
       FROM organization_invitations oi
       JOIN users u ON oi.inviter_id = u.id
       WHERE oi.organization_id = ? AND oi.status = 'pending'
       ORDER BY oi.created_at DESC`,
      [organizationId]
    );
    return rows;
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE organization_invitations SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM organization_invitations WHERE id = ?', [id]);
  }

  static async deleteByEmail(organizationId, email) {
    await pool.execute(
      'DELETE FROM organization_invitations WHERE organization_id = ? AND invitee_email = ?',
      [organizationId, email]
    );
  }
}

module.exports = OrganizationInvitation;
