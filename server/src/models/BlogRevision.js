const mongoose = require('mongoose');

/**
 * An immutable snapshot of a blog at one point in time. Kept in its own collection
 * so blog documents stay small and the listing queries stay cheap.
 *
 * Restoring a revision writes a new revision rather than removing any, so content
 * is never lost.
 */
const BlogRevisionSchema = new mongoose.Schema({
	blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
	revisionNumber: { type: Number, required: true },

	title: { type: String, default: '', trim: true },
	description: { type: String, default: '' },
	contentBlocks: { type: mongoose.Schema.Types.Mixed, default: null },
	contentHtml: { type: String, default: '' },

	author: { type: String, default: '', trim: true },
	tags: { type: [String], default: [] },
	categories: { type: [String], default: [] },
	seo: { type: mongoose.Schema.Types.Mixed, default: null },
	coverImage: { type: mongoose.Schema.Types.Mixed, default: null },

	wordCount: { type: Number, default: 0 },
	// Free text describing what changed, e.g. "Published" or "Restored from #4".
	changeSummary: { type: String, default: '', trim: true },
	createdBy: { type: String, default: '', trim: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

BlogRevisionSchema.index({ blogId: 1, revisionNumber: -1 }, { unique: true });

module.exports = mongoose.models.BlogRevision || mongoose.model('BlogRevision', BlogRevisionSchema);
