const mongoose = require('mongoose');
const { BLOG_STATUSES, BLOG_STATUS, CURRENT_BLOG_SCHEMA_VERSION } = require('../constants/blog');

/**
 * Embedded reference to a MediaAsset. The publicId is duplicated here so a blog can
 * render without a second lookup, and so it survives if the asset record is removed.
 */
const MediaRefSchema = new mongoose.Schema({
	assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'MediaAsset', default: null },
	publicId: { type: String, default: '', trim: true },
	url: { type: String, default: '', trim: true },
	alt: { type: String, default: '', trim: true },
	width: { type: Number, default: 0 },
	height: { type: Number, default: 0 }
}, { _id: false });

const BlogSchema = new mongoose.Schema({
	// ── Original fields, unchanged ──────────────────────────────────────────────
	title: { type: String, required: true, trim: true },
	description: { type: String, required: true, trim: true },
	author: { type: String, required: true, trim: true },
	youtubeUrl: { type: String, default: '', trim: true },
	thumbnailUrl: { type: String, default: '', trim: true },
	featured: { type: Boolean, default: false },
	// Derived mirror of `status`. Kept because the public listing and the existing
	// Blog page both filter on it.
	published: { type: Boolean, default: true },

	// ── Identity ────────────────────────────────────────────────────────────────
	slug: { type: String, default: undefined, trim: true, lowercase: true },

	// ── Publication state ───────────────────────────────────────────────────────
	status: { type: String, enum: BLOG_STATUSES, default: BLOG_STATUS.DRAFT },
	publishedAt: { type: Date, default: null },
	scheduledFor: { type: Date, default: null },
	expiresAt: { type: Date, default: null },

	// ── Content ─────────────────────────────────────────────────────────────────
	// contentBlocks is the single source of truth. contentHtml and contentText are
	// generated from it on every write and must never be accepted from a client.
	contentBlocks: { type: mongoose.Schema.Types.Mixed, default: null },
	contentHtml: { type: String, default: '' },
	contentText: { type: String, default: '' },
	wordCount: { type: Number, default: 0 },
	readingTimeMinutes: { type: Number, default: 0 },

	// ── Server-side draft recovery ──────────────────────────────────────────────
	// Autosave writes here so published content is never touched by an in-progress edit.
	draft: {
		title: { type: String, default: '' },
		contentBlocks: { type: mongoose.Schema.Types.Mixed, default: null },
		savedAt: { type: Date, default: null }
	},

	// ── Taxonomy ────────────────────────────────────────────────────────────────
	tags: { type: [String], default: [] },
	categories: { type: [String], default: [] },

	// ── Media ───────────────────────────────────────────────────────────────────
	coverImage: { type: MediaRefSchema, default: () => ({}) },
	// Every asset referenced by this post, so the media library can report usage.
	mediaPublicIds: { type: [String], default: [] },

	// ── SEO ─────────────────────────────────────────────────────────────────────
	seo: {
		metaTitle: { type: String, default: '', trim: true },
		metaDescription: { type: String, default: '', trim: true },
		canonicalUrl: { type: String, default: '', trim: true },
		ogImageUrl: { type: String, default: '', trim: true },
		noIndex: { type: Boolean, default: false }
	},

	// ── Analytics ───────────────────────────────────────────────────────────────
	// Populated by a later phase; defined now so no migration is needed then.
	stats: {
		views: { type: Number, default: 0 },
		uniqueViews: { type: Number, default: 0 },
		shares: { type: Number, default: 0 },
		avgReadPercent: { type: Number, default: 0 },
		lastViewedAt: { type: Date, default: null }
	},

	// ── Audit ───────────────────────────────────────────────────────────────────
	revisionCount: { type: Number, default: 0 },
	createdBy: { type: String, default: '', trim: true },
	updatedBy: { type: String, default: '', trim: true },
	schemaVersion: { type: Number, default: CURRENT_BLOG_SCHEMA_VERSION }
}, { timestamps: true });

// Unique across posts that have a slug; documents predating the field are exempt.
BlogSchema.index({ slug: 1 }, { unique: true, sparse: true });
// Serves the public listing's filter and sort in one pass.
BlogSchema.index({ published: 1, featured: -1, createdAt: -1 });
// Serves the scheduled-post sweep.
BlogSchema.index({ status: 1, scheduledFor: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ mediaPublicIds: 1 });

module.exports = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
