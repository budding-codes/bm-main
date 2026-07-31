const express = require('express');
const { ensureDatabase } = require('../config/database');
const leadRoutes = require('./leadRoutes');
const authRoutes = require('./authRoutes');
const blogRoutes = require('./blogRoutes');
const mediaRoutes = require('./mediaRoutes');

const router = express.Router();

// Authentication is verified against signed tokens and environment credentials, so
// it is mounted ahead of the database gate: an admin can still sign in, and an
// existing session stays valid, while the database is unreachable.
router.use(authRoutes);

// Everything below reads or writes data. The gate turns a database outage into a
// 503 on these routes instead of a hung request or a crashed process.
router.use(ensureDatabase);

router.use(leadRoutes);
router.use(blogRoutes);
router.use(mediaRoutes);

module.exports = router;
