const express = require('express');
const List = require('../models/List');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all lists for user
router.get('/', auth, async (req, res) => {
  try {
    const lists = await List.findByUserId(req.userId);
    res.json({ lists });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

// Get single list
router.get('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id, req.userId);
    
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json({ list });
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({ error: 'Failed to fetch list' });
  }
});

// Create list
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'List name is required' });
    }

    const listId = await List.create(name, req.userId);
    const list = await List.findById(listId, req.userId);

    res.status(201).json({ 
      message: 'List created successfully',
      list 
    });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

// Update list
router.put('/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'List name is required' });
    }

    const success = await List.update(req.params.id, name, req.userId);

    if (!success) {
      return res.status(404).json({ error: 'List not found' });
    }

    const list = await List.findById(req.params.id, req.userId);
    res.json({ 
      message: 'List updated successfully',
      list 
    });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

// Delete list
router.delete('/:id', auth, async (req, res) => {
  try {
    const success = await List.delete(req.params.id, req.userId);

    if (!success) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

module.exports = router;