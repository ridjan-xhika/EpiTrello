const express = require('express');
const Board = require('../models/Board');
const Column = require('../models/Column');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const { canReadBoard, canWriteBoard, isOwner } = require('../middleware/permissions');

const router = express.Router();

// Get all boards for user
router.get('/', auth, async (req, res) => {
  try {
    const boards = await Board.findByUserId(req.userId);
    
    // Get column counts for each board
    const boardsWithCounts = await Promise.all(
      boards.map(async (board) => {
        const columns = await Column.findByBoardId(board.id);
        return {
          ...board,
          columnCount: columns.length
        };
      })
    );

    res.json({ boards: boardsWithCounts });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// Get single board with details
router.get('/:id', auth, canReadBoard, async (req, res) => {
  try {
    const board = await Board.getWithDetails(req.params.id, req.userId);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json({ board });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

// Create board
router.post('/', auth, async (req, res) => {
  try {
    const { title, organization_id } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Board title is required' });
    }

    const boardId = await Board.create(title, req.userId, organization_id || null);
    const board = await Board.getWithDetails(boardId, req.userId);

    res.status(201).json({ 
      message: 'Board created successfully',
      board 
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Delete board
router.delete('/:id', auth, isOwner, async (req, res) => {
  try {
    const success = await Board.delete(req.params.id, req.userId);

    if (!success) {
      return res.status(404).json({ error: 'Board not found or unauthorized' });
    }

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

module.exports = router;