const express = require('express');
const Card = require('../models/Card');
const Column = require('../models/Column');
const Board = require('../models/Board');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const { canWriteBoard } = require('../middleware/permissions');

const router = express.Router();

// Helper to get board organization
const getBoardOrganization = async (cardId) => {
  const [rows] = await require('../config/database').execute(
    `SELECT b.organization_id 
     FROM cards c 
     JOIN columns col ON c.column_id = col.id 
     JOIN boards b ON col.board_id = b.id 
     WHERE c.id = ?`,
    [cardId]
  );
  return rows[0]?.organization_id;
};

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
router.post('/', auth, canWriteBoard, verifyBoardAccess, async (req, res) => {
  try {
    const { title, description, columnId, due_date, start_date, time_estimate, priority, cover_color } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Card title is required' });
    }

    if (!columnId) {
      return res.status(400).json({ error: 'Column ID is required' });
    }

    const additionalData = { due_date, start_date, time_estimate, priority, cover_color };
    const cardId = await Card.create(title, description, columnId, req.userId, additionalData);
    const card = await Card.findById(cardId);
    
    // Log activity
    await Card.logActivity(cardId, req.userId, 'created', { title });

    // Log audit action
    const orgId = await getBoardOrganization(cardId);
    if (orgId) {
      await AuditLog.logAction(
        orgId,
        req.userId,
        'card_created',
        'card',
        cardId,
        { card_title: title },
        req.ip
      );
    }

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
router.put('/:id', auth, canWriteBoard, async (req, res) => {
  try {
    const { title, description, due_date, start_date, time_estimate, time_spent, priority, cover_color, completed, boardId } = req.body;

    // Only validate title if it's being updated
    if (title !== undefined && (!title || !title.trim())) {
      return res.status(400).json({ error: 'Card title is required' });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (time_estimate !== undefined) updateData.time_estimate = time_estimate;
    if (time_spent !== undefined) updateData.time_spent = time_spent;
    if (priority !== undefined) updateData.priority = priority;
    if (cover_color !== undefined) updateData.cover_color = cover_color;
    if (completed !== undefined) updateData.completed = completed;

    const success = await Card.update(req.params.id, updateData);

    if (!success) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const card = await Card.findById(req.params.id);

    // Log audit action
    const orgId = await getBoardOrganization(req.params.id);
    if (orgId) {
      await AuditLog.logAction(
        orgId,
        req.userId,
        'card_updated',
        'card',
        req.params.id,
        { card_title: card.title, changes: Object.keys(updateData) },
        req.ip
      );
    }

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
router.delete('/:id', auth, canWriteBoard, async (req, res) => {
  try {
    // Get card info before deleting for audit log
    const card = await Card.findById(req.params.id);
    const orgId = await getBoardOrganization(req.params.id);

    const success = await Card.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Log audit action
    if (orgId && card) {
      await AuditLog.logAction(
        orgId,
        req.userId,
        'card_deleted',
        'card',
        req.params.id,
        { card_title: card.title },
        req.ip
      );
    }

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// Get card details
router.get('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(card);
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Failed to fetch card' });
  }
});

// Labels
router.post('/:id/labels', auth, canWriteBoard, async (req, res) => {
  try {
    const { name, color } = req.body;
    const labelId = await Card.addLabel(req.params.id, name, color);
    res.status(201).json({ id: labelId, message: 'Label added' });
  } catch (error) {
    console.error('Add label error:', error);
    res.status(500).json({ error: 'Failed to add label' });
  }
});

router.delete('/:id/labels/:labelId', auth, canWriteBoard, async (req, res) => {
  try {
    await Card.removeLabel(req.params.labelId);
    res.json({ message: 'Label removed' });
  } catch (error) {
    console.error('Remove label error:', error);
    res.status(500).json({ error: 'Failed to remove label' });
  }
});

// Members
router.post('/:id/members', auth, canWriteBoard, async (req, res) => {
  try {
    const { userId } = req.body;
    await Card.addMember(req.params.id, userId);
    res.status(201).json({ message: 'Member added' });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

router.delete('/:id/members/:userId', auth, canWriteBoard, async (req, res) => {
  try {
    await Card.removeMember(req.params.id, req.params.userId);
    res.json({ message: 'Member removed' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Checklists
router.post('/:id/checklists', auth, canWriteBoard, async (req, res) => {
  try {
    const { title } = req.body;
    const checklistId = await Card.addChecklist(req.params.id, title);
    await Card.logActivity(req.params.id, req.userId, 'checklist_added', { title });
    res.status(201).json({ id: checklistId, message: 'Checklist added' });
  } catch (error) {
    console.error('Add checklist error:', error);
    res.status(500).json({ error: 'Failed to add checklist' });
  }
});

router.delete('/:id/checklists/:checklistId', auth, canWriteBoard, async (req, res) => {
  try {
    await Card.deleteChecklist(req.params.checklistId);
    res.json({ message: 'Checklist deleted' });
  } catch (error) {
    console.error('Delete checklist error:', error);
    res.status(500).json({ error: 'Failed to delete checklist' });
  }
});

// Checklist items
router.post('/:id/checklists/:checklistId/items', auth, canWriteBoard, async (req, res) => {
  try {
    const { text, assigned_to, due_date } = req.body;
    const itemId = await Card.addChecklistItem(req.params.checklistId, text, assigned_to, due_date);
    res.status(201).json({ id: itemId, message: 'Item added' });
  } catch (error) {
    console.error('Add checklist item error:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

router.put('/:id/checklists/:checklistId/items/:itemId', auth, canWriteBoard, async (req, res) => {
  try {
    await Card.updateChecklistItem(req.params.itemId, req.body);
    res.json({ message: 'Item updated' });
  } catch (error) {
    console.error('Update checklist item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/:id/checklists/:checklistId/items/:itemId', auth, canWriteBoard, async (req, res) => {
  try {
    await Card.deleteChecklistItem(req.params.itemId);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Delete checklist item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Comments
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const comments = await Card.getComments(req.params.id);
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { comment } = req.body;
    const commentId = await Card.addComment(req.params.id, req.userId, comment);
    await Card.logActivity(req.params.id, req.userId, 'commented', { comment });
    res.status(201).json({ id: commentId, message: 'Comment added' });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    await Card.deleteComment(req.params.commentId);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Activity
router.get('/:id/activity', auth, async (req, res) => {
  try {
    const activity = await Card.getActivity(req.params.id);
    res.json(activity);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Reorder card (drag and drop)
router.post('/reorder', auth, canWriteBoard, verifyBoardAccess, async (req, res) => {
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