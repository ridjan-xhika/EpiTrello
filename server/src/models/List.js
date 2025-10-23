const db = require('../config/database');

class List {
  static async create(name, userId) {
    const [result] = await db.execute(
      'INSERT INTO lists (name, user_id) VALUES (?, ?)',
      [name, userId]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM lists WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  static async findById(listId, userId) {
    const [rows] = await db.execute(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [listId, userId]
    );
    return rows[0];
  }

  static async update(listId, name, userId) {
    const [result] = await db.execute(
      'UPDATE lists SET name = ? WHERE id = ? AND user_id = ?',
      [name, listId, userId]
    );
    return result.affectedRows > 0;
  }

  static async delete(listId, userId) {
    const [result] = await db.execute(
      'DELETE FROM lists WHERE id = ? AND user_id = ?',
      [listId, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = List;