const express = require('express');
const leadController = require('../controllers/leadController');
const { requireAdminAuth } = require('../middleware/requireAdminAuth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

// Public lead capture, used by the enquiry forms across the marketing pages.
router.post('/store-user-info', asyncHandler(leadController.create, 'Failed to store user info.'));

// Legacy alias for the admin leads list. Kept for compatibility; prefer /admin/leads.
router.get('/store-user-info', requireAdminAuth, asyncHandler(leadController.listAsUsers, 'Failed to fetch users.'));

router.get('/admin/leads', requireAdminAuth, asyncHandler(leadController.list, 'Failed to fetch leads.'));
router.patch('/admin/leads/:id', requireAdminAuth, asyncHandler(leadController.update, 'Failed to update lead.'));

module.exports = router;
