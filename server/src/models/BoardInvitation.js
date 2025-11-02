const db = require('../config/database');
const crypto = require('crypto');

class BoardInvitation {
  static async create(boardId, inviterId, inviteeEmail, role = 'read') {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [result] = await db.execute(
      `INSERT INTO board_invitations 
       (board_id, inviter_id, invitee_email, role, token, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [boardId, inviterId, inviteeEmail, role, token, expiresAt]
    );

    return { id: result.insertId, token };
  }

  static async findByToken(token) {
    const [rows] = await db.execute(
      `SELECT bi.*, b.title as board_title, u.name as inviter_name 
       FROM board_invitations bi 
       JOIN boards b ON bi.board_id = b.id 
       JOIN users u ON bi.inviter_id = u.id 
       WHERE bi.token = ? AND bi.status = 'pending' AND bi.expires_at > NOW()`,
      [token]
    );
    return rows[0];
  }

  static async accept(token, userId) {
    const invitation = await this.findByToken(token);
    if (!invitation) return null;

    await db.execute(
      'UPDATE board_invitations SET status = "accepted" WHERE token = ?',
      [token]
    );

    // Add user as board member
    const BoardMember = require('./BoardMember');
    await BoardMember.addMember(invitation.board_id, userId, invitation.role);

    return invitation;
  }

  static async decline(token) {
    await db.execute(
      'UPDATE board_invitations SET status = "declined" WHERE token = ?',
      [token]
    );
  }

  static async getPendingInvitations(email) {
    const [rows] = await db.execute(
      `SELECT bi.*, b.title as board_title, u.name as inviter_name 
       FROM board_invitations bi 
       JOIN boards b ON bi.board_id = b.id 
       JOIN users u ON bi.inviter_id = u.id 
       WHERE bi.invitee_email = ? 
         AND bi.status = 'pending' 
         AND bi.expires_at > NOW()
       ORDER BY bi.created_at DESC`,
      [email]
    );
    return rows;
  }

  static async cancelInvitation(invitationId, userId) {
    const [result] = await db.execute(
      `DELETE FROM board_invitations 
       WHERE id = ? AND inviter_id = ? AND status = 'pending'`,
      [invitationId, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = BoardInvitation;
