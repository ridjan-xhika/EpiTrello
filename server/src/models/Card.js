const db = require('../config/database');

class Card {
  static async create(title, description, columnId) {
    // Get max position
    const [maxPos] = await db.execute(
      'SELECT COALESCE(MAX(position), -1) as maxPos FROM cards WHERE column_id = ?',
      [columnId]
    );
    const position = maxPos[0].maxPos + 1;

    const [result] = await db.execute(
      'INSERT INTO cards (title, description, column_id, position) VALUES (?, ?, ?, ?)',
      [title, description || '', columnId, position]
    );
    return result.insertId;
  }

  static async findById(cardId) {
    const [rows] = await db.execute(
      'SELECT * FROM cards WHERE id = ?',
      [cardId]
    );
    return rows[0];
  }

  static async update(cardId, { title, description }) {
    const [result] = await db.execute(
      'UPDATE cards SET title = ?, description = ? WHERE id = ?',
      [title, description, cardId]
    );
    return result.affectedRows > 0;
  }

  static async delete(cardId) {
    const card = await this.findById(cardId);
    if (!card) return false;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute('DELETE FROM cards WHERE id = ?', [cardId]);

      // Reorder remaining cards
      await connection.execute(
        'UPDATE cards SET position = position - 1 WHERE column_id = ? AND position > ?',
        [card.column_id, card.position]
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

  static async reorder(cardId, sourceColumnId, destColumnId, sourceIndex, destIndex) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      if (sourceColumnId === destColumnId) {
        // Same column reorder
        if (sourceIndex < destIndex) {
          await connection.execute(
            'UPDATE cards SET position = position - 1 WHERE column_id = ? AND position > ? AND position <= ?',
            [sourceColumnId, sourceIndex, destIndex]
          );
        } else {
          await connection.execute(
            'UPDATE cards SET position = position + 1 WHERE column_id = ? AND position >= ? AND position < ?',
            [sourceColumnId, destIndex, sourceIndex]
          );
        }
        await connection.execute(
          'UPDATE cards SET position = ? WHERE id = ?',
          [destIndex, cardId]
        );
      } else {
        // Move to different column
        await connection.execute(
          'UPDATE cards SET position = position - 1 WHERE column_id = ? AND position > ?',
          [sourceColumnId, sourceIndex]
        );
        await connection.execute(
          'UPDATE cards SET position = position + 1 WHERE column_id = ? AND position >= ?',
          [destColumnId, destIndex]
        );
        await connection.execute(
          'UPDATE cards SET column_id = ?, position = ? WHERE id = ?',
          [destColumnId, destIndex, cardId]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findByColumnId(columnId) {
    const [rows] = await db.execute(
      'SELECT * FROM cards WHERE column_id = ? ORDER BY position',
      [columnId]
    );
    return rows;
  }
}

module.exports = Card;