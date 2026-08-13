/**
 * Production canonical origin and the public paths that belong in the sitemap.
 *
 * Keep this list aligned with the SPA routes in `client/src/App.tsx`. Paths that
 * exist in the router but must not be indexed (admin, stubs, promo leftovers)
 * are omitted here rather than listed and then filtered.
 *
 * Apex `buddingmariners.com` 301s to `www.buddingmariners.com`, so sitemap and
 * canonical URLs always use the www host. Trailing slashes match the router:
 * homepage has one, every other path does not.
 */
const DEFAULT_SITE_ORIGIN = 'https://www.buddingmariners.com';

const PUBLIC_PAGE_PATHS = [
	'/',
	'/about',
	'/courses',
	'/bm-offline-academy',
	'/bm-hostel',
	'/blog',
	'/calculators',
	'/free-materials',
	'/college-forms',
	'/terms-of-use',
	'/privacy-policy',
	'/refund-policy'
];

function isBlockedHost(hostname) {
	const host = String(hostname || '').toLowerCase();
	return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local') || host.endsWith('.vercel.app');
}

/**
 * Returns a safe https origin. Unset, malformed, http, localhost, and Vercel
 * preview/API hosts all fall back to the production canonical origin so a
 * misconfigured environment can never emit development URLs into the sitemap.
 */
function resolveSiteOrigin(value) {
	const raw = String(value || '').trim();
	if (!raw) {
		return DEFAULT_SITE_ORIGIN;
	}

	try {
		const url = new URL(raw);
		if (url.protocol !== 'https:' || isBlockedHost(url.hostname)) {
			return DEFAULT_SITE_ORIGIN;
		}
		return `${url.protocol}//${url.host}`;
	} catch {
		return DEFAULT_SITE_ORIGIN;
	}
}

function pageUrl(origin, path) {
	if (!path || path === '/') {
		return `${origin}/`;
	}

	const withSlash = path.startsWith('/') ? path : `/${path}`;
	return `${origin}${withSlash.replace(/\/+$/, '')}`;
}

module.exports = {
	DEFAULT_SITE_ORIGIN,
	PUBLIC_PAGE_PATHS,
	resolveSiteOrigin,
	pageUrl,
	isBlockedHost
};
