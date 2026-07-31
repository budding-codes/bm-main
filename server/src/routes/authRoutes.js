const express = require('express');
const authController = require('../controllers/authController');
const { requireAdminAuth } = require('../middleware/requireAdminAuth');

const router = express.Router();

router.post('/admin/login', authController.login);
router.get('/admin/session', requireAdminAuth, authController.session);

module.exports = router;
