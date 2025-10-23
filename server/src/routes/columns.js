const express = require('express');
const Column = require('../models/Column');
const Board = require('../models/Board');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to verify board access
const verifyBoardAccess = async (req, res, next) => {
  try {
    const { boardId } = req.body;
    const board = await Board.findById(boardId, req.userId);
    
    if (!board) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify access' });
  }
};

// Create column
router.post('/', auth, verifyBoardAccess, async (req, res) => {
  try {
    const { title, boardId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Column title is required' });
    }

    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' });
    }

    const columnId = await Column.create(title, boardId);
    const column = await Column.findById(columnId);

    res.status(201).json({ 
      message: 'Column created successfully',
      column 
    });
  } catch (error) {
    console.error('Create column error:', error);
    res.status(500).json({ error: 'Failed to create column' });
  }
});

// Update column
router.put('/:id', auth, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Column title is required' });
    }

    const success = await Column.update(req.params.id, title);

    if (!success) {
      return res.status(404).json({ error: 'Column not found' });
    }

    const column = await Column.findById(req.params.id);
    res.json({ 
      message: 'Column updated successfully',
      column 
    });
  } catch (error) {
    console.error('Update column error:', error);
    res.status(500).json({ error: 'Failed to update column' });
  }
});

// Delete column
router.delete('/:id', auth, async (req, res) => {
  try {
    const success = await Column.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Column not found' });
    }

    res.json({ message: 'Column deleted successfully' });
  } catch (error) {
    console.error('Delete column error:', error);
    res.status(500).json({ error: 'Failed to delete column' });
  }
});

module.exports = router;