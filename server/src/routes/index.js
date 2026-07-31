const express = require('express');
const leadRoutes = require('./leadRoutes');
const authRoutes = require('./authRoutes');
const blogRoutes = require('./blogRoutes');
const mediaRoutes = require('./mediaRoutes');

const router = express.Router();

router.use(leadRoutes);
router.use(authRoutes);
router.use(blogRoutes);
router.use(mediaRoutes);

module.exports = router;
