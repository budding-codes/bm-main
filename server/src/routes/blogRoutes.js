const express = require('express');
const blogController = require('../controllers/blogController');
const { requireAdminAuth } = require('../middleware/requireAdminAuth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/blogs', asyncHandler(blogController.listPublished, 'Failed to fetch blogs.'));
router.get('/blogs/:slug', asyncHandler(blogController.getBySlug, 'Failed to fetch blog.'));

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get('/admin/blogs', requireAdminAuth, asyncHandler(blogController.listAll, 'Failed to fetch blogs.'));
router.post('/admin/blogs', requireAdminAuth, asyncHandler(blogController.create, 'Failed to create blog.'));

// Registered before /admin/blogs/:id so the literal segments are not captured as ids.
router.get('/admin/blogs/:id/revisions', requireAdminAuth, asyncHandler(blogController.listRevisions, 'Failed to load revisions.'));
router.get('/admin/blogs/:id/revisions/:revisionNumber', requireAdminAuth, asyncHandler(blogController.getRevision, 'Failed to load revision.'));
router.post('/admin/blogs/:id/revisions/:revisionNumber/restore', requireAdminAuth, asyncHandler(blogController.restoreRevision, 'Failed to restore revision.'));

router.put('/admin/blogs/:id/draft', requireAdminAuth, asyncHandler(blogController.saveDraft, 'Failed to save draft.'));
router.delete('/admin/blogs/:id/draft', requireAdminAuth, asyncHandler(blogController.discardDraft, 'Failed to discard draft.'));

router.get('/admin/blogs/:id', requireAdminAuth, asyncHandler(blogController.getOne, 'Failed to fetch blog.'));
router.put('/admin/blogs/:id', requireAdminAuth, asyncHandler(blogController.update, 'Failed to update blog.'));
router.patch('/admin/blogs/:id', requireAdminAuth, asyncHandler(blogController.patch, 'Failed to update blog.'));
router.delete('/admin/blogs/:id', requireAdminAuth, asyncHandler(blogController.remove, 'Failed to delete blog.'));

module.exports = router;
