const express = require('express');
const User = require('../models/User');
const BoardMember = require('../models/BoardMember');
const auth = require('../middleware/auth');

const router = express.Router();

// Get current user profile (MUST BE BEFORE /:userId route)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        bio: user.bio || '',
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user profile by ID (public)
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get shared boards count
    const [countResult] = await require('../config/database').execute(
      'SELECT COUNT(DISTINCT board_id) as count FROM board_members WHERE user_id = ?',
      [userId]
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        bio: user.bio || '',
        created_at: user.created_at,
        boardsCount: countResult[0].count
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, username, email, bio } = req.body;

    // Check if username is taken by another user
    if (username) {
      const existingUser = await User.findByUsername(username);
      if (existingUser && existingUser.id !== req.userId) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Check if email is taken by another user
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== req.userId) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    await User.updateProfile(req.userId, { name, username, email, bio });

    const updatedUser = await User.findById(req.userId);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        bio: updatedUser.bio || ''
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get user with password
    const [rows] = await require('../config/database').execute(
      'SELECT * FROM users WHERE id = ?',
      [req.userId]
    );
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await User.validatePassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    await User.updatePassword(req.userId, newPassword);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

module.exports = router;
