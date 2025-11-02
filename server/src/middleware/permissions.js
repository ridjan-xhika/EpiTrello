const BoardMember = require('../models/BoardMember');
const Card = require('../models/Card');
const db = require('../config/database');

// Middleware to check if user can read board
const canReadBoard = async (req, res, next) => {
  try {
    const boardId = req.params.boardId || req.params.id;
    const userId = req.userId;

    const canRead = await BoardMember.canRead(boardId, userId);
    if (!canRead) {
      return res.status(403).json({ error: 'You do not have access to this board' });
    }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ error: 'Failed to check permissions' });
  }
};

// Middleware to check if user can write to board
const canWriteBoard = async (req, res, next) => {
  try {
    let boardId = req.params.boardId || req.body.boardId;
    const userId = req.userId;

    // If boardId not found, check if this is a card route and get board_id from card
    if (!boardId && req.params.id) {
      // Try to get board_id from card via columns table
      const cardId = req.params.id;
      const [cards] = await db.query(
        'SELECT col.board_id FROM cards c JOIN columns col ON c.column_id = col.id WHERE c.id = ?',
        [cardId]
      );
      
      if (cards.length > 0) {
        boardId = cards[0].board_id;
      } else {
        // If no card found, assume req.params.id is a board id
        boardId = req.params.id;
      }
    }

    const canWrite = await BoardMember.canWrite(boardId, userId);
    if (!canWrite) {
      return res.status(403).json({ error: 'You do not have permission to edit this board' });
    }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ error: 'Failed to check permissions' });
  }
};

// Middleware to check if user has admin access
const hasAdminAccess = async (req, res, next) => {
  try {
    const boardId = req.params.boardId || req.params.id;
    const userId = req.userId;

    const hasAdmin = await BoardMember.hasAdminAccess(boardId, userId);
    if (!hasAdmin) {
      return res.status(403).json({ error: 'You need admin access for this action' });
    }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ error: 'Failed to check permissions' });
  }
};

// Middleware to check if user is owner
const isOwner = async (req, res, next) => {
  try {
    const boardId = req.params.boardId || req.params.id;
    const userId = req.userId;

    const owner = await BoardMember.isOwner(boardId, userId);
    if (!owner) {
      return res.status(403).json({ error: 'Only the board owner can perform this action' });
    }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ error: 'Failed to check permissions' });
  }
};

module.exports = {
  canReadBoard,
  canWriteBoard,
  hasAdminAccess,
  isOwner
};
