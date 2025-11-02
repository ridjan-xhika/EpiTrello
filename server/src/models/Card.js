const db = require('../config/database');

class Card {
  static async create(title, description, columnId, userId = null, additionalData = {}) {
    // Get max position
    const [maxPos] = await db.execute(
      'SELECT COALESCE(MAX(position), -1) as maxPos FROM cards WHERE column_id = ?',
      [columnId]
    );
    const position = maxPos[0].maxPos + 1;

    const {
      due_date = null,
      start_date = null,
      time_estimate = null,
      priority = 'medium',
      cover_color = null
    } = additionalData;

    const [result] = await db.execute(
      `INSERT INTO cards (title, description, column_id, position, due_date, start_date, 
       time_estimate, priority, cover_color, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || '', columnId, position, due_date, start_date, 
       time_estimate, priority, cover_color, userId]
    );
    return result.insertId;
  }

  static async findById(cardId) {
    const [rows] = await db.execute(
      `SELECT c.*, col.board_id, u.name as creator_name, u.username as creator_username
       FROM cards c
       LEFT JOIN users u ON c.created_by = u.id
       LEFT JOIN columns col ON c.column_id = col.id
       WHERE c.id = ?`,
      [cardId]
    );
    
    if (rows[0]) {
      // Convert MySQL boolean (0/1) to JavaScript boolean
      rows[0].completed = Boolean(rows[0].completed);
      
      // Get labels, members, checklists
      const [labels] = await db.execute('SELECT * FROM card_labels WHERE card_id = ?', [cardId]);
      const [members] = await db.execute(
        `SELECT cm.*, u.name, u.username, u.email 
         FROM card_members cm 
         JOIN users u ON cm.user_id = u.id 
         WHERE cm.card_id = ?`,
        [cardId]
      );
      const [checklists] = await db.execute(
        'SELECT * FROM card_checklists WHERE card_id = ? ORDER BY position',
        [cardId]
      );
      
      // Get checklist items for each checklist
      for (let checklist of checklists) {
        const [items] = await db.execute(
          `SELECT ci.*, u.name as assigned_name, u.username as assigned_username
           FROM checklist_items ci
           LEFT JOIN users u ON ci.assigned_to = u.id
           WHERE ci.checklist_id = ? ORDER BY ci.position`,
          [checklist.id]
        );
        checklist.items = items;
      }
      
      rows[0].labels = labels;
      rows[0].members = members;
      rows[0].checklists = checklists;
    }
    
    return rows[0];
  }

  static async update(cardId, data) {
    const fields = [];
    const values = [];
    
    const allowedFields = [
      'title', 'description', 'due_date', 'start_date', 'completed', 
      'completed_at', 'time_estimate', 'time_spent', 'priority', 'cover_color'
    ];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        
        // Handle boolean conversion for MySQL
        if (field === 'completed' && typeof data[field] === 'boolean') {
          values.push(data[field] ? 1 : 0);
        } 
        // Handle null/empty priority
        else if (field === 'priority' && (data[field] === null || data[field] === '')) {
          values.push(null);
        }
        else {
          values.push(data[field]);
        }
      }
    }
    
    if (fields.length === 0) return false;
    
    values.push(cardId);
    const [result] = await db.execute(
      `UPDATE cards SET ${fields.join(', ')} WHERE id = ?`,
      values
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

  // Labels
  static async addLabel(cardId, name, color) {
    const [result] = await db.execute(
      'INSERT INTO card_labels (card_id, name, color) VALUES (?, ?, ?)',
      [cardId, name, color]
    );
    return result.insertId;
  }

  static async removeLabel(labelId) {
    await db.execute('DELETE FROM card_labels WHERE id = ?', [labelId]);
  }

  static async getLabels(cardId) {
    const [rows] = await db.execute('SELECT * FROM card_labels WHERE card_id = ?', [cardId]);
    return rows;
  }

  // Members
  static async addMember(cardId, userId) {
    try {
      const [result] = await db.execute(
        'INSERT INTO card_members (card_id, user_id) VALUES (?, ?)',
        [cardId, userId]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') return null;
      throw error;
    }
  }

  static async removeMember(cardId, userId) {
    await db.execute('DELETE FROM card_members WHERE card_id = ? AND user_id = ?', [cardId, userId]);
  }

  static async getMembers(cardId) {
    const [rows] = await db.execute(
      `SELECT cm.*, u.name, u.username, u.email 
       FROM card_members cm 
       JOIN users u ON cm.user_id = u.id 
       WHERE cm.card_id = ?`,
      [cardId]
    );
    return rows;
  }

  // Checklists
  static async addChecklist(cardId, title) {
    const [maxPos] = await db.execute(
      'SELECT COALESCE(MAX(position), -1) as maxPos FROM card_checklists WHERE card_id = ?',
      [cardId]
    );
    const position = maxPos[0].maxPos + 1;

    const [result] = await db.execute(
      'INSERT INTO card_checklists (card_id, title, position) VALUES (?, ?, ?)',
      [cardId, title, position]
    );
    return result.insertId;
  }

  static async deleteChecklist(checklistId) {
    await db.execute('DELETE FROM card_checklists WHERE id = ?', [checklistId]);
  }

  static async addChecklistItem(checklistId, text, assignedTo = null, dueDate = null) {
    const [maxPos] = await db.execute(
      'SELECT COALESCE(MAX(position), -1) as maxPos FROM checklist_items WHERE checklist_id = ?',
      [checklistId]
    );
    const position = maxPos[0].maxPos + 1;

    const [result] = await db.execute(
      'INSERT INTO checklist_items (checklist_id, text, position, assigned_to, due_date) VALUES (?, ?, ?, ?, ?)',
      [checklistId, text, position, assignedTo, dueDate]
    );
    return result.insertId;
  }

  static async updateChecklistItem(itemId, data) {
    const fields = [];
    const values = [];
    
    if (data.text !== undefined) {
      fields.push('text = ?');
      values.push(data.text);
    }
    if (data.completed !== undefined) {
      fields.push('completed = ?');
      values.push(data.completed);
    }
    if (data.assigned_to !== undefined) {
      fields.push('assigned_to = ?');
      values.push(data.assigned_to);
    }
    if (data.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(data.due_date);
    }
    
    if (fields.length === 0) return false;
    
    values.push(itemId);
    await db.execute(
      `UPDATE checklist_items SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  static async deleteChecklistItem(itemId) {
    await db.execute('DELETE FROM checklist_items WHERE id = ?', [itemId]);
  }

  // Comments
  static async addComment(cardId, userId, comment) {
    const [result] = await db.execute(
      'INSERT INTO card_comments (card_id, user_id, comment) VALUES (?, ?, ?)',
      [cardId, userId, comment]
    );
    return result.insertId;
  }

  static async getComments(cardId) {
    const [rows] = await db.execute(
      `SELECT cc.*, u.name, u.username 
       FROM card_comments cc 
       JOIN users u ON cc.user_id = u.id 
       WHERE cc.card_id = ? 
       ORDER BY cc.created_at DESC`,
      [cardId]
    );
    return rows;
  }

  static async deleteComment(commentId) {
    await db.execute('DELETE FROM card_comments WHERE id = ?', [commentId]);
  }

  // Activity
  static async logActivity(cardId, userId, actionType, actionData = null) {
    await db.execute(
      'INSERT INTO card_activity (card_id, user_id, action_type, action_data) VALUES (?, ?, ?, ?)',
      [cardId, userId, actionType ? JSON.stringify(actionType) : null, actionData ? JSON.stringify(actionData) : null]
    );
  }

  static async getActivity(cardId) {
    const [rows] = await db.execute(
      `SELECT ca.*, u.name, u.username 
       FROM card_activity ca 
       JOIN users u ON ca.user_id = u.id 
       WHERE ca.card_id = ? 
       ORDER BY ca.created_at DESC 
       LIMIT 50`,
      [cardId]
    );
    return rows;
  }
}

module.exports = Card;