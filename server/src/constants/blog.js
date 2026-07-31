const BLOG_STATUS = {
	DRAFT: 'draft',
	SCHEDULED: 'scheduled',
	PUBLISHED: 'published',
	ARCHIVED: 'archived'
};

const BLOG_STATUSES = Object.values(BLOG_STATUS);

/**
 * 1 — original seven-field schema.
 * 2 — rich content, slugs, scheduling, SEO, media references, analytics.
 */
const CURRENT_BLOG_SCHEMA_VERSION = 2;

const READING_WORDS_PER_MINUTE = 200;
const META_DESCRIPTION_MAX = 160;
const EXCERPT_MAX = 200;

module.exports = {
	BLOG_STATUS,
	BLOG_STATUSES,
	CURRENT_BLOG_SCHEMA_VERSION,
	READING_WORDS_PER_MINUTE,
	META_DESCRIPTION_MAX,
	EXCERPT_MAX
};
