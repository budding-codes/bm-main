const { PUBLIC_PAGE_PATHS, pageUrl } = require('./site');
const { isValidSlug } = require('../utils/slug');

const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';

function escapeXml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function formatLastmod(value) {
	if (!value) {
		return null;
	}

	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return date.toISOString().slice(0, 10);
}

function staticPageEntries(origin) {
	return PUBLIC_PAGE_PATHS.map((path) => ({ loc: pageUrl(origin, path) }));
}

/**
 * Resolves the canonical loc for a published post.
 *
 * Off-site or non-https canonicals are dropped: those posts should not appear
 * in this host's sitemap. Relative canonicals are resolved against `origin`.
 */
function blogLoc(origin, blog) {
	const custom = String(blog && blog.seo && blog.seo.canonicalUrl || '').trim();
	if (custom) {
		if (custom.startsWith('/') && !custom.startsWith('//')) {
			return pageUrl(origin, custom);
		}

		try {
			const url = new URL(custom);
			if (url.protocol !== 'https:' || `${url.protocol}//${url.host}` !== origin) {
				return null;
			}
			return pageUrl(origin, url.pathname);
		} catch {
			return null;
		}
	}

	const slug = String(blog && blog.slug || '').trim().toLowerCase();
	if (!isValidSlug(slug)) {
		return null;
	}

	return pageUrl(origin, `/blog/${slug}`);
}

function blogEntries(origin, blogs) {
	if (!Array.isArray(blogs)) {
		return [];
	}

	return blogs
		.filter((blog) => !(blog && blog.seo && blog.seo.noIndex))
		.map((blog) => {
			const loc = blogLoc(origin, blog);
			if (!loc) {
				return null;
			}

			return {
				loc,
				lastmod: formatLastmod(blog.updatedAt || blog.publishedAt || blog.createdAt)
			};
		})
		.filter(Boolean);
}

function dedupeEntries(entries) {
	const seen = new Set();
	const unique = [];

	for (const entry of entries) {
		if (!entry || !entry.loc || seen.has(entry.loc)) {
			continue;
		}
		seen.add(entry.loc);
		unique.push(entry);
	}

	return unique;
}

function collectSitemapEntries(origin, blogs) {
	return dedupeEntries([
		...staticPageEntries(origin),
		...blogEntries(origin, blogs)
	]);
}

function buildUrlsetXml(entries) {
	const body = entries
		.map((entry) => {
			const lines = [`    <loc>${escapeXml(entry.loc)}</loc>`];
			if (entry.lastmod) {
				lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
			}
			return `  <url>\n${lines.join('\n')}\n  </url>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${SITEMAP_NS}">\n${body}\n</urlset>\n`;
}

function buildSitemapXml(origin, blogs) {
	return buildUrlsetXml(collectSitemapEntries(origin, blogs));
}

module.exports = {
	SITEMAP_NS,
	escapeXml,
	formatLastmod,
	staticPageEntries,
	blogLoc,
	blogEntries,
	dedupeEntries,
	collectSitemapEntries,
	buildUrlsetXml,
	buildSitemapXml
};
