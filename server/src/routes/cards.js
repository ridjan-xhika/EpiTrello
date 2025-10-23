const express = require('express');
const Card = require('../models/Card');
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

// Create card
router.post('/', auth, verifyBoardAccess, async (req, res) => {
  try {
    const { title, description, columnId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Card title is required' });
    }

    if (!columnId) {
      return res.status(400).json({ error: 'Column ID is required' });
    }

    const cardId = await Card.create(title, description, columnId);
    const card = await Card.findById(cardId);

    res.status(201).json({ 
      message: 'Card created successfully',
      card 
    });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Update card
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Card title is required' });
    }

    const success = await Card.update(req.params.id, { title, description });

    if (!success) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const card = await Card.findById(req.params.id);
    res.json({ 
      message: 'Card updated successfully',
      card 
    });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Delete card
router.delete('/:id', auth, async (req, res) => {
  try {
    const success = await Card.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// Reorder card (drag and drop)
router.post('/reorder', auth, verifyBoardAccess, async (req, res) => {
  try {
    const { cardId, sourceColumnId, destColumnId, sourceIndex, destIndex } = req.body;

    if (!cardId || !sourceColumnId || !destColumnId || sourceIndex === undefined || destIndex === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    await Card.reorder(cardId, sourceColumnId, destColumnId, sourceIndex, destIndex);

    res.json({ message: 'Card reordered successfully' });
  } catch (error) {
    console.error('Reorder card error:', error);
    res.status(500).json({ error: 'Failed to reorder card' });
  }
});

module.exports = router;