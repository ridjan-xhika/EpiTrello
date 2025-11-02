const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');
const Organization = require('../models/Organization');

// Get audit logs for an organization
router.get('/organizations/:id/audit-logs', auth, async (req, res) => {
  try {
    const organizationId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const actionType = req.query.actionType;

    // Check if user is member of the organization
    const isMember = await Organization.isMember(organizationId, req.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let logs;
    if (actionType) {
      logs = await AuditLog.getLogsByActionType(organizationId, actionType, limit, offset);
    } else {
      logs = await AuditLog.getOrganizationLogs(organizationId, limit, offset);
    }

    const total = await AuditLog.getOrganizationLogCount(organizationId);

    res.json({
      logs,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
