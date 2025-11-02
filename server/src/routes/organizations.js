const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const OrganizationMember = require('../models/OrganizationMember');
const OrganizationInvitation = require('../models/OrganizationInvitation');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');

// Create organization
router.post('/', auth, async (req, res) => {
  try {
    const { name, display_name, description } = req.body;

    if (!name || !display_name) {
      return res.status(400).json({ error: 'Name and display name are required' });
    }

    const organizationId = await Organization.create({
      name: name.toLowerCase().replace(/\s+/g, '-'),
      display_name,
      description,
      created_by: req.userId
    });

    // Add creator as owner
    await OrganizationMember.addMember(organizationId, req.userId, 'owner');

    // Log audit action
    await AuditLog.logAction(
      organizationId,
      req.userId,
      'organization_created',
      'organization',
      organizationId,
      { organization_name: display_name },
      req.ip
    );

    res.status(201).json({ 
      id: organizationId, 
      message: 'Organization created successfully' 
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// Get user's organizations
router.get('/', auth, async (req, res) => {
  try {
    const organizations = await Organization.findByUserId(req.userId);
    res.json(organizations);
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Get organization by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const organizationId = req.params.id;

    // Check if user is a member
    const isMember = await OrganizationMember.isMember(organizationId, req.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Get user's role
    const userRole = await OrganizationMember.getMemberRole(organizationId, req.userId);
    organization.userRole = userRole;

    res.json(organization);
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// Update organization
router.put('/:id', auth, async (req, res) => {
  try {
    const organizationId = req.params.id;
    const { display_name, description } = req.body;

    // Check if user is admin or owner
    const isAdmin = await OrganizationMember.isAdmin(organizationId, req.userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can update organization' });
    }

    await Organization.update(organizationId, { display_name, description });
    res.json({ message: 'Organization updated successfully' });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

// Delete organization
router.delete('/:id', auth, async (req, res) => {
  try {
    const organizationId = req.params.id;

    // Check if user is owner
    const isOwner = await OrganizationMember.isOwner(organizationId, req.userId);
    if (!isOwner) {
      return res.status(403).json({ error: 'Only owners can delete organization' });
    }

    await Organization.delete(organizationId);
    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

// Get organization members
router.get('/:id/members', auth, async (req, res) => {
  try {
    const organizationId = req.params.id;

    // Check if user is a member
    const isMember = await OrganizationMember.isMember(organizationId, req.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const members = await OrganizationMember.getMembers(organizationId);
    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Invite user to organization
router.post('/:id/invite', auth, async (req, res) => {
  try {
    const organizationId = req.params.id;
    const { email, role = 'member' } = req.body;

    // Check if user is admin or owner
    const isAdmin = await OrganizationMember.isAdmin(organizationId, req.userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can invite members' });
    }

    // Check if user exists
    const invitee = await User.findByEmail(email);
    if (!invitee) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a member
    const isMember = await OrganizationMember.isMember(organizationId, invitee.id);
    if (isMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Delete any existing invitations
    await OrganizationInvitation.deleteByEmail(organizationId, email);

    // Create invitation
    const { token } = await OrganizationInvitation.create(
      organizationId,
      req.userId,
      email,
      role
    );

    res.status(201).json({ 
      message: 'Invitation sent successfully',
      token 
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Add member directly (without invitation)
router.post('/:id/members', auth, async (req, res) => {
  try {
    const organizationId = req.params.id;
    const { email, role = 'member' } = req.body;

    // Check if user is admin or owner
    const isAdmin = await OrganizationMember.isAdmin(organizationId, req.userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    // Check if user exists
    const newMember = await User.findByEmail(email);
    if (!newMember) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    // Check if already a member
    const isMember = await OrganizationMember.isMember(organizationId, newMember.id);
    if (isMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add member directly
    await OrganizationMember.addMember(organizationId, newMember.id, role);

    // Log audit action
    await AuditLog.logAction(
      organizationId,
      req.userId,
      'member_added',
      'organization_member',
      newMember.id,
      { member_name: newMember.name, member_email: email, role },
      req.ip
    );

    res.status(201).json({ 
      message: 'Member added successfully',
      member: {
        id: newMember.id,
        email: newMember.email,
        name: newMember.name,
        role
      }
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Get pending invitations
router.get('/:id/invitations', auth, async (req, res) => {
  try {
    const organizationId = req.params.id;

    // Check if user is admin or owner
    const isAdmin = await OrganizationMember.isAdmin(organizationId, req.userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can view invitations' });
    }

    const invitations = await OrganizationInvitation.getByOrganization(organizationId);
    res.json(invitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Accept invitation
router.post('/invitations/:token/accept', auth, async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await OrganizationInvitation.findByToken(token);
    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // Check if invitation is for current user
    const user = await User.findById(req.userId);
    if (user.email !== invitation.invitee_email) {
      return res.status(403).json({ error: 'This invitation is not for you' });
    }

    // Add user to organization
    await OrganizationMember.addMember(
      invitation.organization_id,
      req.userId,
      invitation.role
    );

    // Update invitation status
    await OrganizationInvitation.updateStatus(invitation.id, 'accepted');

    res.json({ 
      message: 'Invitation accepted successfully',
      organizationId: invitation.organization_id
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Update member role
router.put('/:id/members/:userId', auth, async (req, res) => {
  try {
    const { id: organizationId, userId } = req.params;
    const { role } = req.body;

    // Check if user is admin or owner
    const isAdmin = await OrganizationMember.isAdmin(organizationId, req.userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can update roles' });
    }

    // Can't change owner role
    const targetRole = await OrganizationMember.getMemberRole(organizationId, parseInt(userId));
    if (targetRole === 'owner') {
      return res.status(403).json({ error: 'Cannot change owner role' });
    }

    // Can't make someone owner unless you are owner
    if (role === 'owner') {
      const isOwner = await OrganizationMember.isOwner(organizationId, req.userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Only owners can assign owner role' });
      }
    }

    await OrganizationMember.updateRole(organizationId, parseInt(userId), role);

    // Get member info for audit log
    const member = await User.findById(parseInt(userId));
    
    // Log audit action
    if (member) {
      await AuditLog.logAction(
        organizationId,
        req.userId,
        'member_role_updated',
        'organization_member',
        parseInt(userId),
        { member_name: member.name, old_role: targetRole, new_role: role },
        req.ip
      );
    }

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

// Remove member
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const { id: organizationId, userId } = req.params;

    // Check if user is admin or owner, or removing themselves
    const isAdmin = await OrganizationMember.isAdmin(organizationId, req.userId);
    const isSelf = req.userId === parseInt(userId);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can't remove owner
    const targetRole = await OrganizationMember.getMemberRole(organizationId, parseInt(userId));
    if (targetRole === 'owner' && !isSelf) {
      return res.status(403).json({ error: 'Cannot remove owner' });
    }

    // Get member info for audit log before removal
    const member = await User.findById(parseInt(userId));

    await OrganizationMember.removeMember(organizationId, parseInt(userId));

    // Log audit action
    if (member) {
      await AuditLog.logAction(
        organizationId,
        req.userId,
        'member_removed',
        'organization_member',
        parseInt(userId),
        { member_name: member.name, was_self: isSelf },
        req.ip
      );
    }

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Get organization boards
router.get('/:id/boards', auth, async (req, res) => {
  try {
    const organizationId = req.params.id;

    // Check if user is a member
    const isMember = await OrganizationMember.isMember(organizationId, req.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const boards = await Organization.getBoards(organizationId);
    res.json(boards);
  } catch (error) {
    console.error('Get organization boards error:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

module.exports = router;
