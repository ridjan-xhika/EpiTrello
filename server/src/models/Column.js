const db = require('../config/database');

class Column {
  static async create(title, boardId) {
    // Get max position
    const [maxPos] = await db.execute(
      'SELECT COALESCE(MAX(position), -1) as maxPos FROM columns WHERE board_id = ?',
      [boardId]
    );
    const position = maxPos[0].maxPos + 1;

    const [result] = await db.execute(
      'INSERT INTO columns (title, board_id, position) VALUES (?, ?, ?)',
      [title, boardId, position]
    );
    return result.insertId;
  }

  static async findById(columnId) {
    const [rows] = await db.execute(
      'SELECT * FROM columns WHERE id = ?',
      [columnId]
    );
    return rows[0];
  }

  static async findByBoardId(boardId) {
    const [rows] = await db.execute(
      'SELECT * FROM columns WHERE board_id = ? ORDER BY position',
      [boardId]
    );
    return rows;
  }

  static async delete(columnId) {
    const column = await this.findById(columnId);
    if (!column) return false;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Delete all cards in column (cascade)
      await connection.execute('DELETE FROM columns WHERE id = ?', [columnId]);

      // Reorder remaining columns
      await connection.execute(
        'UPDATE columns SET position = position - 1 WHERE board_id = ? AND position > ?',
        [column.board_id, column.position]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(columnId, title) {
    const [result] = await db.execute(
      'UPDATE columns SET title = ? WHERE id = ?',
      [title, columnId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Column;