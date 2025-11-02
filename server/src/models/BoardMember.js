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
    // First check if user is a direct board member
    const [rows] = await db.execute(
      'SELECT role FROM board_members WHERE board_id = ? AND user_id = ?',
      [boardId, userId]
    );
    
    if (rows[0]) {
      return rows[0].role;
    }
    
    // If not a direct member, check if they're an organization member
    const [orgRows] = await db.execute(
      `SELECT om.role 
       FROM boards b
       JOIN organization_members om ON b.organization_id = om.organization_id
       WHERE b.id = ? AND om.user_id = ? AND b.organization_id IS NOT NULL`,
      [boardId, userId]
    );
    
    if (orgRows[0]) {
      // Organization members get 'write' access by default
      // Admins and owners get 'admin' access
      return ['admin', 'owner'].includes(orgRows[0].role) ? 'admin' : 'write';
    }
    
    return null;
  }

  static async getBoardMembers(boardId) {
    const [rows] = await db.execute(
      `SELECT DISTINCT
         COALESCE(bm.user_id, om.user_id) as user_id,
         u.name, 
         u.username, 
         u.email,
         COALESCE(bm.role,
           CASE 
             WHEN om.role IN ('admin', 'owner') THEN 'admin'
             ELSE 'write'
           END
         ) as role,
         CASE WHEN bm.user_id IS NOT NULL THEN bm.created_at ELSE om.created_at END as created_at,
         CASE WHEN om.user_id IS NOT NULL THEN true ELSE false END as via_organization
       FROM boards b
       LEFT JOIN board_members bm ON b.id = bm.board_id
       LEFT JOIN organization_members om ON b.organization_id = om.organization_id AND b.organization_id IS NOT NULL
       JOIN users u ON u.id = COALESCE(bm.user_id, om.user_id)
       WHERE b.id = ? AND (bm.user_id IS NOT NULL OR om.user_id IS NOT NULL)
       ORDER BY 
         CASE COALESCE(bm.role, CASE WHEN om.role IN ('admin', 'owner') THEN 'admin' ELSE 'write' END)
           WHEN 'owner' THEN 1 
           WHEN 'admin' THEN 2 
           WHEN 'write' THEN 3 
           WHEN 'read' THEN 4 
         END,
         created_at`,
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
      `SELECT DISTINCT b.*, 
        COALESCE(bm.role, 
          CASE 
            WHEN om.role IN ('admin', 'owner') THEN 'admin'
            ELSE 'write'
          END
        ) as role
       FROM boards b 
       LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_id = ?
       LEFT JOIN organization_members om ON b.organization_id = om.organization_id AND om.user_id = ?
       WHERE bm.user_id IS NOT NULL OR om.user_id IS NOT NULL
       ORDER BY b.updated_at DESC`,
      [userId, userId]
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
