const mongoose = require('mongoose');
const { MEDIA_KINDS, MEDIA_RESOURCE_TYPES } = require('../constants/media');

/**
 * One record per file in Cloudinary. Delivery URLs are built at render time from
 * `publicId`, so no transformation is baked into what is stored here.
 */
const MediaAssetSchema = new mongoose.Schema({
	publicId: { type: String, required: true, trim: true },
	// Cloudinary's own upload/delivery type: image, video, or raw.
	resourceType: { type: String, enum: MEDIA_RESOURCE_TYPES, required: true },
	// The category the library filters by: image, video, audio, document, other.
	kind: { type: String, enum: MEDIA_KINDS, required: true },

	url: { type: String, default: '', trim: true },
	format: { type: String, default: '', trim: true },
	mimeType: { type: String, default: '', trim: true },
	bytes: { type: Number, default: 0 },
	width: { type: Number, default: 0 },
	height: { type: Number, default: 0 },
	durationSeconds: { type: Number, default: 0 },
	pages: { type: Number, default: 0 },
	folder: { type: String, default: '', trim: true },

	originalFilename: { type: String, default: '', trim: true },
	displayName: { type: String, default: '', trim: true },
	alt: { type: String, default: '', trim: true },
	caption: { type: String, default: '', trim: true },
	tags: { type: [String], default: [] },

	// Maintained when a blog is saved, so the library can warn before deleting
	// something that is still referenced.
	usedInBlogs: { type: [mongoose.Schema.Types.ObjectId], ref: 'Blog', default: [] },
	usageCount: { type: Number, default: 0 },

	uploadedBy: { type: String, default: '', trim: true },
	// Soft delete: the Cloudinary file is destroyed but the record is retained so
	// existing posts can still explain a missing image.
	deletedAt: { type: Date, default: null }
}, { timestamps: true });

MediaAssetSchema.index({ publicId: 1 }, { unique: true });
MediaAssetSchema.index({ deletedAt: 1, kind: 1, createdAt: -1 });
MediaAssetSchema.index({ tags: 1 });
MediaAssetSchema.index({ displayName: 'text', originalFilename: 'text', alt: 'text', caption: 'text' });

module.exports = mongoose.models.MediaAsset || mongoose.model('MediaAsset', MediaAssetSchema);
