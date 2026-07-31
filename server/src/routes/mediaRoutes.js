const express = require('express');
const mediaController = require('../controllers/mediaController');
const { requireAdminAuth } = require('../middleware/requireAdminAuth');
const { upload, handleUploadErrors } = require('../middleware/upload');
const { asyncHandler } = require('../utils/asyncHandler');
const { MAX_FILES_PER_REQUEST } = require('../constants/media');

const router = express.Router();

// Assets are addressed by their MediaAsset id rather than their Cloudinary public
// ID, which contains slashes and would need a wildcard path segment.
router.get('/admin/media', requireAdminAuth, asyncHandler(mediaController.list, 'Failed to load media.'));
router.get('/admin/media/:id', requireAdminAuth, asyncHandler(mediaController.getOne, 'Failed to load media asset.'));

router.post(
	'/admin/media',
	requireAdminAuth,
	upload.single('file'),
	handleUploadErrors,
	asyncHandler(mediaController.upload, 'Upload failed.')
);

router.post(
	'/admin/media/batch',
	requireAdminAuth,
	upload.array('files', MAX_FILES_PER_REQUEST),
	handleUploadErrors,
	asyncHandler(mediaController.uploadMany, 'Batch upload failed.')
);

router.patch('/admin/media/:id', requireAdminAuth, asyncHandler(mediaController.update, 'Failed to update media asset.'));
router.delete('/admin/media/:id', requireAdminAuth, asyncHandler(mediaController.remove, 'Failed to delete media asset.'));

module.exports = router;
