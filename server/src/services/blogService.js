const Blog = require('../models/Blog');
const BlogRevision = require('../models/BlogRevision');
const mediaService = require('./mediaService');
const { renderContent } = require('../content/renderer');
const { resolveThumbnailUrl } = require('../utils/youtube');
const { generateSlug, isValidSlug, buildUniqueSlug } = require('../utils/slug');
const { htmlToText, countWords, estimateReadingTime, buildExcerpt } = require('../utils/text');
const { badRequest, notFound } = require('../utils/httpError');
const {
	BLOG_STATUS,
	BLOG_STATUSES,
	META_DESCRIPTION_MAX,
	EXCERPT_MAX,
	CURRENT_BLOG_SCHEMA_VERSION
} = require('../constants/blog');

const LIST_SORT = { featured: -1, createdAt: -1 };
const MAX_REVISIONS_PER_BLOG = 50;

// ── Visibility ────────────────────────────────────────────────────────────────

/**
 * A post is publicly visible when it is published, or scheduled with its time
 * reached, and has not expired.
 *
 * Evaluating this at read time means no background job is needed, so a host that
 * sleeps between requests cannot miss a scheduled publication.
 */
function publicVisibilityFilter(now = new Date()) {
	return {
		$and: [
			{
				$or: [
					{ status: BLOG_STATUS.PUBLISHED },
					{ status: BLOG_STATUS.SCHEDULED, scheduledFor: { $lte: now } },
					// Documents predating the status field fall back to the boolean.
					{ status: { $exists: false }, published: true }
				]
			},
			{ $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }] }
		]
	};
}

// ── Normalisation ─────────────────────────────────────────────────────────────

function normalizeTags(value) {
	if (!Array.isArray(value)) {
		return undefined;
	}

	return [...new Set(value.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))];
}

function parseDate(value) {
	if (!value) {
		return null;
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function resolveStatus(body, current) {
	if (body.status !== undefined) {
		const status = String(body.status).trim().toLowerCase();
		if (!BLOG_STATUSES.includes(status)) {
			throw badRequest(`Status must be one of: ${BLOG_STATUSES.join(', ')}.`);
		}
		return status;
	}

	// The original API expressed state as a boolean; honour it when no status is given.
	if (body.published !== undefined) {
		return body.published === false ? BLOG_STATUS.DRAFT : BLOG_STATUS.PUBLISHED;
	}

	return current || BLOG_STATUS.DRAFT;
}

function has(body, key) {
	return Object.prototype.hasOwnProperty.call(body, key);
}

/**
 * Builds a `$set` object containing only the fields the request actually supplied.
 *
 * This is deliberate: a whole-document write would let a small request — a publish
 * toggle, say — replace rich content with schema defaults.
 */
function buildBlogUpdate(body, existing = null) {
	const update = {};

	if (has(body, 'title')) {
		const title = String(body.title || '').trim();
		if (!title) {
			throw badRequest('Title cannot be empty.');
		}
		update.title = title;
	}

	if (has(body, 'author')) {
		update.author = String(body.author || '').trim() || 'BM Team';
	}

	if (has(body, 'youtubeUrl') || has(body, 'thumbnailUrl')) {
		const youtubeUrl = has(body, 'youtubeUrl') ? String(body.youtubeUrl || '').trim() : (existing?.youtubeUrl || '');
		const thumbnailUrl = has(body, 'thumbnailUrl') ? String(body.thumbnailUrl || '').trim() : (existing?.thumbnailUrl || '');

		update.youtubeUrl = youtubeUrl;
		update.thumbnailUrl = resolveThumbnailUrl({ youtubeUrl, thumbnailUrl });
	}

	if (has(body, 'featured')) {
		update.featured = Boolean(body.featured);
	}

	const tags = normalizeTags(body.tags);
	if (tags) {
		update.tags = tags;
	}

	const categories = normalizeTags(body.categories);
	if (categories) {
		update.categories = categories;
	}

	if (has(body, 'coverImage')) {
		const cover = body.coverImage || {};
		update.coverImage = {
			assetId: cover.assetId || null,
			publicId: String(cover.publicId || '').trim(),
			url: String(cover.url || '').trim(),
			alt: String(cover.alt || '').trim(),
			width: Number(cover.width) || 0,
			height: Number(cover.height) || 0
		};
	}

	if (has(body, 'seo') && body.seo) {
		const seo = body.seo;
		update.seo = {
			metaTitle: String(seo.metaTitle || '').trim(),
			metaDescription: String(seo.metaDescription || '').trim().slice(0, META_DESCRIPTION_MAX),
			canonicalUrl: String(seo.canonicalUrl || '').trim(),
			ogImageUrl: String(seo.ogImageUrl || '').trim(),
			noIndex: Boolean(seo.noIndex)
		};
	} else if (has(body, 'metaDescription')) {
		// Flat field kept for compatibility with the original payload shape.
		update['seo.metaDescription'] = String(body.metaDescription || '').trim().slice(0, META_DESCRIPTION_MAX);
	}

	return update;
}

/**
 * Applies scheduling fields and keeps `published` in step with `status`, so the
 * boolean the public listing and the existing Blog page rely on stays correct.
 */
function applyPublicationState(update, body, existing) {
	const currentStatus = existing?.status;
	const status = resolveStatus(body, currentStatus);

	update.status = status;
	update.published = status === BLOG_STATUS.PUBLISHED;

	if (has(body, 'scheduledFor')) {
		update.scheduledFor = parseDate(body.scheduledFor);
	}
	if (has(body, 'expiresAt')) {
		update.expiresAt = parseDate(body.expiresAt);
	}

	const scheduledFor = has(body, 'scheduledFor') ? update.scheduledFor : existing?.scheduledFor;
	if (status === BLOG_STATUS.SCHEDULED && !scheduledFor) {
		throw badRequest('A scheduled post needs a publish date.');
	}

	if (status === BLOG_STATUS.PUBLISHED && !existing?.publishedAt) {
		update.publishedAt = new Date();
	}

	return update;
}

/** Renders content and derives the excerpt, word count, and reading time from it. */
function applyContent(update, body, existing) {
	if (!has(body, 'contentBlocks')) {
		// Allow the plain description to be edited on its own, as the original form did.
		if (has(body, 'description')) {
			update.description = String(body.description || '').trim();
			if (!existing?.contentBlocks) {
				const words = countWords(update.description);
				update.wordCount = words;
				update.readingTimeMinutes = estimateReadingTime(words);
			}
		}
		return update;
	}

	const rendered = renderContent(body.contentBlocks);

	update.contentBlocks = rendered.contentBlocks;
	update.contentHtml = rendered.contentHtml;
	update.contentText = rendered.contentText;
	update.wordCount = rendered.wordCount;
	update.readingTimeMinutes = rendered.readingTimeMinutes;
	update.mediaPublicIds = rendered.mediaPublicIds;

	// The card excerpt follows the content unless the author wrote one explicitly.
	const explicitDescription = has(body, 'description') ? String(body.description || '').trim() : '';
	update.description = explicitDescription || buildExcerpt(rendered.contentText, EXCERPT_MAX);

	return update;
}

// ── Slugs ─────────────────────────────────────────────────────────────────────

async function isSlugTaken(slug, excludeId = null) {
	const query = { slug };
	if (excludeId) {
		query._id = { $ne: excludeId };
	}

	return Boolean(await Blog.exists(query));
}

async function resolveSlug(body, { title, existing = null }) {
	const requested = has(body, 'slug') ? String(body.slug || '').trim().toLowerCase() : '';

	if (requested) {
		const normalized = generateSlug(requested);
		if (!isValidSlug(normalized)) {
			throw badRequest('That slug is not valid. Use lowercase letters, numbers, and hyphens.');
		}
		if (existing && normalized === existing.slug) {
			return undefined;
		}
		if (await isSlugTaken(normalized, existing?._id)) {
			throw badRequest('That slug is already in use.');
		}
		return normalized;
	}

	if (existing?.slug) {
		return undefined;
	}

	return buildUniqueSlug(title, (candidate) => isSlugTaken(candidate, existing?._id));
}

// ── Revisions ─────────────────────────────────────────────────────────────────

async function recordRevision(blog, { changeSummary, createdBy }) {
	const revisionNumber = (blog.revisionCount || 0) + 1;

	await BlogRevision.create({
		blogId: blog._id,
		revisionNumber,
		title: blog.title,
		description: blog.description,
		contentBlocks: blog.contentBlocks,
		contentHtml: blog.contentHtml,
		author: blog.author,
		tags: blog.tags,
		categories: blog.categories,
		seo: blog.seo,
		coverImage: blog.coverImage,
		wordCount: blog.wordCount,
		changeSummary,
		createdBy
	});

	await Blog.updateOne({ _id: blog._id }, { $set: { revisionCount: revisionNumber } });

	// Keep history bounded; the oldest snapshots are dropped first.
	const excess = await BlogRevision.find({ blogId: blog._id })
		.sort({ revisionNumber: -1 })
		.skip(MAX_REVISIONS_PER_BLOG)
		.select('_id');

	if (excess.length > 0) {
		await BlogRevision.deleteMany({ _id: { $in: excess.map((doc) => doc._id) } });
	}

	return revisionNumber;
}

function listRevisions(blogId) {
	return BlogRevision.find({ blogId })
		.sort({ revisionNumber: -1 })
		.select('-contentBlocks -contentHtml');
}

async function getRevision(blogId, revisionNumber) {
	const revision = await BlogRevision.findOne({ blogId, revisionNumber: Number(revisionNumber) });
	if (!revision) {
		throw notFound('Revision not found.');
	}

	return revision;
}

/** Restores a snapshot by writing it forward as a new revision; nothing is removed. */
async function restoreRevision(blogId, revisionNumber, actor) {
	const revision = await getRevision(blogId, revisionNumber);
	const blog = await getBlogById(blogId);

	await recordRevision(blog, {
		changeSummary: `Snapshot before restoring revision ${revision.revisionNumber}`,
		createdBy: actor
	});

	const rendered = renderContent(revision.contentBlocks);

	const restored = await Blog.findByIdAndUpdate(blogId, {
		$set: {
			title: revision.title,
			description: revision.description,
			contentBlocks: rendered.contentBlocks,
			contentHtml: rendered.contentHtml,
			contentText: rendered.contentText,
			wordCount: rendered.wordCount,
			readingTimeMinutes: rendered.readingTimeMinutes,
			mediaPublicIds: rendered.mediaPublicIds,
			tags: revision.tags,
			categories: revision.categories,
			seo: revision.seo || {},
			coverImage: revision.coverImage || {},
			updatedBy: actor
		}
	}, { new: true, runValidators: true });

	await mediaService.syncUsage(restored._id, rendered.mediaPublicIds);

	return restored;
}

// ── Queries ───────────────────────────────────────────────────────────────────

const PUBLIC_LIST_FIELDS = '-contentBlocks -contentHtml -contentText -draft -mediaPublicIds';
const ADMIN_LIST_FIELDS = '-contentBlocks -contentHtml -contentText -draft';

function listPublishedBlogs() {
	return Blog.find(publicVisibilityFilter()).select(PUBLIC_LIST_FIELDS).sort(LIST_SORT);
}

const SITEMAP_FIELDS = 'slug updatedAt publishedAt createdAt seo.canonicalUrl seo.noIndex';

function listSitemapBlogs() {
	return Blog.find({
		...publicVisibilityFilter(),
		slug: { $exists: true, $nin: [null, ''] },
		'seo.noIndex': { $ne: true }
	})
		.select(SITEMAP_FIELDS)
		.lean();
}

function listAllBlogs() {
	return Blog.find().select(ADMIN_LIST_FIELDS).sort(LIST_SORT);
}

async function getBlogById(id) {
	const blog = await Blog.findById(id);
	if (!blog) {
		throw notFound('Blog not found.');
	}

	return blog;
}

async function getPublishedBlogBySlug(slug) {
	const blog = await Blog.findOne({
		slug: String(slug || '').trim().toLowerCase(),
		...publicVisibilityFilter()
	}).select('-draft');

	if (!blog) {
		throw notFound('Blog not found.');
	}

	return blog;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

async function ensureSingleFeaturedBlog(nextFeaturedId) {
	if (!nextFeaturedId) {
		return;
	}

	await Blog.updateMany({ _id: { $ne: nextFeaturedId } }, { $set: { featured: false } });
}

async function createBlog(body, actor = '') {
	const update = buildBlogUpdate(body);
	applyContent(update, body, null);
	applyPublicationState(update, body, null);

	if (!update.title || !update.description) {
		throw badRequest('Title and description are required.');
	}

	// buildBlogUpdate only emits supplied fields, which is what makes partial updates
	// safe. Creation still has to satisfy the fields the schema requires.
	if (update.author === undefined) {
		update.author = 'BM Team';
	}

	update.slug = await resolveSlug(body, { title: update.title });
	update.createdBy = actor;
	update.updatedBy = actor;
	update.schemaVersion = CURRENT_BLOG_SCHEMA_VERSION;

	const blog = await Blog.create(update);

	if (blog.featured) {
		await ensureSingleFeaturedBlog(blog._id);
	}

	await mediaService.syncUsage(blog._id, blog.mediaPublicIds);
	await recordRevision(blog, { changeSummary: 'Created', createdBy: actor });

	return blog;
}

function describeChange(update) {
	if (update.contentBlocks !== undefined) {
		return 'Content updated';
	}
	if (update.status !== undefined) {
		return `Status set to ${update.status}`;
	}

	return 'Settings updated';
}

async function updateBlog(id, body, actor = '', { recordHistory = true } = {}) {
	const existing = await getBlogById(id);

	const update = buildBlogUpdate(body, existing);
	applyContent(update, body, existing);
	applyPublicationState(update, body, existing);

	// Preserve the original contract: a full-form save must carry both fields.
	if (has(body, 'title') && has(body, 'description') && !update.description) {
		throw badRequest('Title and description are required.');
	}

	const slug = await resolveSlug(body, { title: update.title || existing.title, existing });
	if (slug) {
		update.slug = slug;
	}

	update.updatedBy = actor;
	update.schemaVersion = CURRENT_BLOG_SCHEMA_VERSION;

	// A save supersedes any autosaved draft.
	if (update.contentBlocks !== undefined) {
		update['draft.contentBlocks'] = null;
		update['draft.title'] = '';
		update['draft.savedAt'] = null;
	}

	const blog = await Blog.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });

	if (blog.featured) {
		await ensureSingleFeaturedBlog(blog._id);
	}

	if (update.mediaPublicIds) {
		await mediaService.syncUsage(blog._id, update.mediaPublicIds);
	}

	if (recordHistory) {
		await recordRevision(blog, { changeSummary: describeChange(update), createdBy: actor });
	}

	return blog;
}

/**
 * Stores an in-progress draft without touching the live content, so autosave can
 * never overwrite what readers currently see.
 */
async function saveDraft(id, body, actor = '') {
	const existing = await getBlogById(id);

	const draft = {
		'draft.title': has(body, 'title') ? String(body.title || '').trim() : existing.title,
		'draft.contentBlocks': has(body, 'contentBlocks') ? body.contentBlocks : existing.draft?.contentBlocks,
		'draft.savedAt': new Date(),
		updatedBy: actor
	};

	if (draft['draft.contentBlocks']) {
		// Validate now rather than at publish time, so a broken draft is caught early.
		renderContent(draft['draft.contentBlocks']);
	}

	return Blog.findByIdAndUpdate(id, { $set: draft }, { new: true }).select('draft updatedAt');
}

async function discardDraft(id) {
	await getBlogById(id);

	return Blog.findByIdAndUpdate(id, {
		$set: { 'draft.title': '', 'draft.contentBlocks': null, 'draft.savedAt': null }
	}, { new: true }).select('draft updatedAt');
}

async function deleteBlog(id) {
	const blog = await Blog.findByIdAndDelete(id);
	if (!blog) {
		throw notFound('Blog not found.');
	}

	await Promise.all([
		BlogRevision.deleteMany({ blogId: blog._id }),
		mediaService.releaseUsage(blog._id)
	]);

	return blog;
}

module.exports = {
	publicVisibilityFilter,
	listPublishedBlogs,
	listSitemapBlogs,
	listAllBlogs,
	getBlogById,
	getPublishedBlogBySlug,
	createBlog,
	updateBlog,
	deleteBlog,
	saveDraft,
	discardDraft,
	listRevisions,
	getRevision,
	restoreRevision,
	ensureSingleFeaturedBlog,
	MAX_REVISIONS_PER_BLOG
};
