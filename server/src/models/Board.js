const db = require('../config/database');

class Board {
  static async create(title, userId, organizationId = null) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        'INSERT INTO boards (title, user_id, organization_id) VALUES (?, ?, ?)',
        [title, userId, organizationId]
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
      `SELECT DISTINCT b.*, o.name as organization_name, o.display_name as organization_display_name
       FROM boards b
       LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_id = ?
       LEFT JOIN organizations o ON b.organization_id = o.id
       LEFT JOIN organization_members om ON b.organization_id = om.organization_id AND om.user_id = ?
       WHERE bm.user_id IS NOT NULL OR om.user_id IS NOT NULL
       ORDER BY b.updated_at DESC`,
      [userId, userId]
    );
    return rows;
  }

  static async findById(boardId, userId) {
    const [rows] = await db.execute(
      `SELECT b.*, o.name as organization_name, o.display_name as organization_display_name
       FROM boards b
       LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_id = ?
       LEFT JOIN organizations o ON b.organization_id = o.id
       LEFT JOIN organization_members om ON b.organization_id = om.organization_id AND om.user_id = ?
       WHERE b.id = ? AND (bm.user_id IS NOT NULL OR om.user_id IS NOT NULL)`,
      [userId, userId, boardId]
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

    // Get labels, members, and checklists for all cards
    const cardIds = cards.map(c => c.id);
    
    // Initialize empty arrays for all cards and convert boolean fields
    cards.forEach(card => {
      card.completed = Boolean(card.completed);
      card.labels = [];
      card.members = [];
      card.checklists = [];
      card.comments = [];
      card.attachments = [];
    });
    
    if (cardIds.length > 0) {
      const placeholders = cardIds.map(() => '?').join(',');
      
      // Get all labels
      const [labels] = await db.execute(
        `SELECT * FROM card_labels WHERE card_id IN (${placeholders})`,
        cardIds
      );
      
      // Get all members
      const [members] = await db.execute(
        `SELECT cm.card_id, cm.user_id, u.name, u.username, u.email 
         FROM card_members cm 
         JOIN users u ON cm.user_id = u.id 
         WHERE cm.card_id IN (${placeholders})`,
        cardIds
      );
      
      // Get all checklists
      const [checklists] = await db.execute(
        `SELECT * FROM card_checklists WHERE card_id IN (${placeholders}) ORDER BY position`,
        cardIds
      );
      
      // Get comments count for each card
      const [comments] = await db.execute(
        `SELECT card_id, COUNT(*) as count FROM card_comments WHERE card_id IN (${placeholders}) GROUP BY card_id`,
        cardIds
      );
      
      // Get attachments count for each card
      const [attachments] = await db.execute(
        `SELECT card_id, COUNT(*) as count FROM card_attachments WHERE card_id IN (${placeholders}) GROUP BY card_id`,
        cardIds
      );
      
      // Get all checklist items
      const checklistIds = checklists.map(cl => cl.id);
      let checklistItems = [];
      if (checklistIds.length > 0) {
        const checklistPlaceholders = checklistIds.map(() => '?').join(',');
        const [items] = await db.execute(
          `SELECT ci.*, u.name as assigned_name, u.username as assigned_username
           FROM checklist_items ci
           LEFT JOIN users u ON ci.assigned_to = u.id
           WHERE ci.checklist_id IN (${checklistPlaceholders}) 
           ORDER BY ci.position`,
          checklistIds
        );
        checklistItems = items;
      }
      
      // Attach items to checklists
      checklists.forEach(checklist => {
        checklist.items = checklistItems.filter(item => item.checklist_id === checklist.id);
      });
      
      // Attach all data to cards
      cards.forEach(card => {
        card.labels = labels.filter(l => l.card_id === card.id);
        card.members = members.filter(m => m.card_id === card.id);
        card.checklists = checklists.filter(cl => cl.card_id === card.id);
        
        // Add comments and attachments as arrays with count
        const commentCount = comments.find(c => c.card_id === card.id);
        const attachmentCount = attachments.find(a => a.card_id === card.id);
        card.comments = commentCount ? Array(parseInt(commentCount.count)).fill({}) : [];
        card.attachments = attachmentCount ? Array(parseInt(attachmentCount.count)).fill({}) : [];
      });
    }

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