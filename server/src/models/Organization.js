const pool = require('../config/database');

class Organization {
  static async create({ name, display_name, description, created_by }) {
    const [result] = await pool.execute(
      'INSERT INTO organizations (name, display_name, description, created_by) VALUES (?, ?, ?, ?)',
      [name, display_name, description, created_by]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT o.*, u.name as creator_name, u.username as creator_username,
       (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id) as member_count,
       (SELECT COUNT(*) FROM boards WHERE organization_id = o.id) as board_count
       FROM organizations o
       JOIN users u ON o.created_by = u.id
       WHERE o.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT o.*, om.role,
       (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id) as member_count,
       (SELECT COUNT(*) FROM boards WHERE organization_id = o.id) as board_count
       FROM organizations o
       JOIN organization_members om ON o.id = om.organization_id
       WHERE om.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows;
  }

  static async update(id, { display_name, description }) {
    await pool.execute(
      'UPDATE organizations SET display_name = ?, description = ? WHERE id = ?',
      [display_name, description, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM organizations WHERE id = ?', [id]);
  }

  static async getBoards(organizationId) {
    const [rows] = await pool.execute(
      `SELECT b.*, u.name as creator_name, u.username as creator_username
       FROM boards b
       JOIN users u ON b.user_id = u.id
       WHERE b.organization_id = ?
       ORDER BY b.created_at DESC`,
      [organizationId]
    );
    return rows;
  }

  static async isMember(organizationId, userId) {
    const [rows] = await pool.execute(
      'SELECT id FROM organization_members WHERE organization_id = ? AND user_id = ?',
      [organizationId, userId]
    );
    return rows.length > 0;
  }
}

module.exports = Organization;
