const express = require('express');
const BoardMember = require('../models/BoardMember');
const BoardInvitation = require('../models/BoardInvitation');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get board members
router.get('/:boardId/members', auth, async (req, res) => {
  try {
    const { boardId } = req.params;

    // Check if user has access to this board
    const canRead = await BoardMember.canRead(boardId, req.userId);
    if (!canRead) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const members = await BoardMember.getBoardMembers(boardId);
    res.json({ members });
  } catch (error) {
    console.error('Get board members error:', error);
    res.status(500).json({ error: 'Failed to fetch board members' });
  }
});

// Invite user to board
router.post('/:boardId/invite', auth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!['admin', 'write', 'read'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user has admin access
    const hasAdmin = await BoardMember.hasAdminAccess(boardId, req.userId);
    if (!hasAdmin) {
      return res.status(403).json({ error: 'Only admins and owners can invite members' });
    }

    // Check if user exists
    const invitee = await User.findByEmail(email);
    
    // If user already exists, add them directly
    if (invitee) {
      // Check if already a member
      const existingRole = await BoardMember.getMemberRole(boardId, invitee.id);
      if (existingRole) {
        return res.status(400).json({ error: 'User is already a member of this board' });
      }

      await BoardMember.addMember(boardId, invitee.id, role);
      return res.json({ 
        message: 'User added to board successfully',
        direct: true 
      });
    }

    // Create invitation for non-existing user
    const { token } = await BoardInvitation.create(boardId, req.userId, email, role);

    res.json({
      message: 'Invitation sent successfully',
      invitationLink: `${req.protocol}://${req.get('host')}/invite/${token}`,
      token
    });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ error: 'Failed to invite user' });
  }
});

// Get pending invitations for current user
router.get('/invitations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const invitations = await BoardInvitation.getPendingInvitations(user.email);
    res.json({ invitations });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Accept invitation
router.post('/invitations/:token/accept', auth, async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await BoardInvitation.accept(token, req.userId);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found or expired' });
    }

    res.json({
      message: 'Invitation accepted',
      boardId: invitation.board_id
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Decline invitation
router.post('/invitations/:token/decline', auth, async (req, res) => {
  try {
    const { token } = req.params;
    await BoardInvitation.decline(token);
    res.json({ message: 'Invitation declined' });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({ error: 'Failed to decline invitation' });
  }
});

// Update member role
router.put('/:boardId/members/:userId', auth, async (req, res) => {
  try {
    const { boardId, userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'write', 'read'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if requester is owner
    const isOwner = await BoardMember.isOwner(boardId, req.userId);
    if (!isOwner) {
      return res.status(403).json({ error: 'Only the owner can change member roles' });
    }

    // Can't change owner's role
    const targetRole = await BoardMember.getMemberRole(boardId, userId);
    if (targetRole === 'owner') {
      return res.status(400).json({ error: 'Cannot change owner role' });
    }

    await BoardMember.updateMemberRole(boardId, userId, role);
    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

// Remove member from board
router.delete('/:boardId/members/:userId', auth, async (req, res) => {
  try {
    const { boardId, userId } = req.params;

    // Check if requester has admin access
    const hasAdmin = await BoardMember.hasAdminAccess(boardId, req.userId);
    if (!hasAdmin) {
      return res.status(403).json({ error: 'Only admins and owners can remove members' });
    }

    const removed = await BoardMember.removeMember(boardId, userId);
    if (!removed) {
      return res.status(400).json({ error: 'Cannot remove owner or member not found' });
    }

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Get user's role for a board
router.get('/:boardId/role', auth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const role = await BoardMember.getMemberRole(boardId, req.userId);

    if (!role) {
      return res.status(403).json({ error: 'Not a member of this board' });
    }

    res.json({ role });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

module.exports = router;
