const db = require('../config/database');

class Board {
  static async create(title, userId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        'INSERT INTO boards (title, user_id) VALUES (?, ?)',
        [title, userId]
      );

      const boardId = result.insertId;

      // Add creator as owner
      await connection.execute(
        'INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)',
        [boardId, userId, 'owner']
      );

      await connection.commit();
      return boardId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT b.* FROM boards b
       INNER JOIN board_members bm ON b.id = bm.board_id
       WHERE bm.user_id = ?
       ORDER BY b.updated_at DESC`,
      [userId]
    );
    return rows;
  }

  static async findById(boardId, userId) {
    const [rows] = await db.execute(
      `SELECT b.* FROM boards b
       INNER JOIN board_members bm ON b.id = bm.board_id
       WHERE b.id = ? AND bm.user_id = ?`,
      [boardId, userId]
    );
    return rows[0];
  }

  static async delete(boardId, userId) {
    const [result] = await db.execute(
      `DELETE b FROM boards b
       INNER JOIN board_members bm ON b.id = bm.board_id
       WHERE b.id = ? AND bm.user_id = ? AND bm.role = 'owner'`,
      [boardId, userId]
    );
    return result.affectedRows > 0;
  }

  static async getWithDetails(boardId, userId) {
    // Check access
    const board = await this.findById(boardId, userId);
    if (!board) return null;

    // Get columns
    const [columns] = await db.execute(
      'SELECT * FROM columns WHERE board_id = ? ORDER BY position',
      [boardId]
    );

    // Get all cards for this board
    const [cards] = await db.execute(
      `SELECT c.* FROM cards c
       INNER JOIN columns col ON c.column_id = col.id
       WHERE col.board_id = ?
       ORDER BY c.position`,
      [boardId]
    );

    // Map cards to columns
    const columnsWithCards = columns.map(column => ({
      ...column,
      cards: cards.filter(card => card.column_id === column.id)
    }));

    return {
      ...board,
      columns: columnsWithCards
    };
  }
}

module.exports = Board;