const express = require('express');
const Column = require('../models/Column');
const Board = require('../models/Board');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const { canWriteBoard } = require('../middleware/permissions');

const router = express.Router();

// Helper to get board organization
const getBoardOrganization = async (columnId) => {
  const [rows] = await require('../config/database').execute(
    `SELECT b.organization_id 
     FROM columns col 
     JOIN boards b ON col.board_id = b.id 
     WHERE col.id = ?`,
    [columnId]
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

// Create column
router.post('/', auth, canWriteBoard, verifyBoardAccess, async (req, res) => {
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

    // Log audit action
    const board = await Board.findById(boardId, req.userId);
    if (board && board.organization_id) {
      await AuditLog.logAction(
        board.organization_id,
        req.userId,
        'column_created',
        'column',
        columnId,
        { column_title: title, board_title: board.title },
        req.ip
      );
    }

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
router.put('/:id', auth, canWriteBoard, async (req, res) => {
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
router.delete('/:id', auth, canWriteBoard, async (req, res) => {
  try {
    // Get column info before deleting for audit log
    const column = await Column.findById(req.params.id);
    const orgId = await getBoardOrganization(req.params.id);

    const success = await Column.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Column not found' });
    }

    // Log audit action
    if (orgId && column) {
      await AuditLog.logAction(
        orgId,
        req.userId,
        'column_deleted',
        'column',
        req.params.id,
        { column_title: column.title },
        req.ip
      );
    }

    res.json({ message: 'Column deleted successfully' });
  } catch (error) {
    console.error('Delete column error:', error);
    res.status(500).json({ error: 'Failed to delete column' });
  }
});

module.exports = router;