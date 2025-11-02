const db = require('../config/database');

class BoardMember {
  static async addMember(boardId, userId, role = 'read') {
    const [result] = await db.execute(
      'INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)',
      [boardId, userId, role]
    );
    return result.insertId;
  }

  static async getMemberRole(boardId, userId) {
    const [rows] = await db.execute(
      'SELECT role FROM board_members WHERE board_id = ? AND user_id = ?',
      [boardId, userId]
    );
    return rows[0]?.role || null;
  }

  static async getBoardMembers(boardId) {
    const [rows] = await db.execute(
      `SELECT bm.*, u.name, u.username, u.email 
       FROM board_members bm 
       JOIN users u ON bm.user_id = u.id 
       WHERE bm.board_id = ?
       ORDER BY 
         CASE bm.role 
           WHEN 'owner' THEN 1 
           WHEN 'admin' THEN 2 
           WHEN 'write' THEN 3 
           WHEN 'read' THEN 4 
         END,
         bm.created_at`,
      [boardId]
    );
    return rows;
  }

  static async updateMemberRole(boardId, userId, role) {
    await db.execute(
      'UPDATE board_members SET role = ? WHERE board_id = ? AND user_id = ?',
      [role, boardId, userId]
    );
  }

  static async removeMember(boardId, userId) {
    const [result] = await db.execute(
      'DELETE FROM board_members WHERE board_id = ? AND user_id = ? AND role != "owner"',
      [boardId, userId]
    );
    return result.affectedRows > 0;
  }

  static async getUserBoards(userId) {
    const [rows] = await db.execute(
      `SELECT b.*, bm.role 
       FROM boards b 
       JOIN board_members bm ON b.id = bm.board_id 
       WHERE bm.user_id = ?
       ORDER BY b.updated_at DESC`,
      [userId]
    );
    return rows;
  }

  static async isOwner(boardId, userId) {
    const role = await this.getMemberRole(boardId, userId);
    return role === 'owner';
  }

  static async canWrite(boardId, userId) {
    const role = await this.getMemberRole(boardId, userId);
    return ['owner', 'admin', 'write'].includes(role);
  }

  static async canRead(boardId, userId) {
    const role = await this.getMemberRole(boardId, userId);
    return ['owner', 'admin', 'write', 'read'].includes(role);
  }

  static async hasAdminAccess(boardId, userId) {
    const role = await this.getMemberRole(boardId, userId);
    return ['owner', 'admin'].includes(role);
  }
}

module.exports = BoardMember;
