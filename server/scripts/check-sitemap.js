/**
 * Pins sitemap XML shape, URL policy, and origin safety.
 *
 *   npm run check:sitemap
 */
const {
	DEFAULT_SITE_ORIGIN,
	PUBLIC_PAGE_PATHS,
	resolveSiteOrigin,
	pageUrl
} = require('../src/seo/site');
const { buildSitemapXml, SITEMAP_NS } = require('../src/seo/sitemap');

let failed = 0;

function check(label, condition) {
	if (condition) {
		console.log(`  PASS  ${label}`);
		return;
	}
	failed += 1;
	console.log(`  FAIL  ${label}`);
}

const origin = resolveSiteOrigin('');
const xml = buildSitemapXml(origin, [
	{
		slug: 'imu-cet-guide',
		updatedAt: new Date('2026-03-01T12:00:00.000Z'),
		seo: { noIndex: false }
	},
	{
		slug: 'draft-notes',
		seo: { noIndex: true }
	},
	{
		slug: 'Not a slug',
		seo: {}
	},
	{
		slug: 'canonical-post',
		seo: { canonicalUrl: `${origin}/blog/canonical-post` }
	},
	{
		slug: 'offsite',
		seo: { canonicalUrl: 'https://example.com/elsewhere' }
	}
]);

check('uses the production www origin by default', origin === DEFAULT_SITE_ORIGIN);
check('rejects localhost', resolveSiteOrigin('http://localhost:5173') === DEFAULT_SITE_ORIGIN);
check('rejects 127.0.0.1', resolveSiteOrigin('https://127.0.0.1') === DEFAULT_SITE_ORIGIN);
check('rejects http', resolveSiteOrigin('http://www.buddingmariners.com') === DEFAULT_SITE_ORIGIN);
check('rejects Vercel preview hosts', resolveSiteOrigin('https://bm-promo-git-seo.vercel.app') === DEFAULT_SITE_ORIGIN);
check('accepts the production origin', resolveSiteOrigin('https://www.buddingmariners.com/') === DEFAULT_SITE_ORIGIN);

check('is valid xml with the sitemap namespace', xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>') && xml.includes(`xmlns="${SITEMAP_NS}"`));
check('homepage uses a trailing slash', xml.includes(`<loc>${origin}/</loc>`));
check('other paths have no trailing slash', xml.includes(`<loc>${origin}/about</loc>`) && !xml.includes(`<loc>${origin}/about/</loc>`));

for (const path of PUBLIC_PAGE_PATHS) {
	check(`includes ${pageUrl(origin, path)}`, xml.includes(`<loc>${pageUrl(origin, path)}</loc>`));
}

check('includes a published blog lastmod from real data', xml.includes(`${origin}/blog/imu-cet-guide`) && xml.includes('<lastmod>2026-03-01</lastmod>'));
check('omits noIndex posts', !xml.includes('draft-notes'));
check('omits invalid slugs', !xml.includes('Not a slug'));
check('omits off-site canonicals', !xml.includes('example.com'));
check('contains no localhost', !xml.includes('localhost') && !xml.includes('127.0.0.1'));
check('contains no preview hosts', !xml.includes('vercel.app'));
check('contains no /admin', !xml.includes('/admin'));
check('contains no /faqs stub', !xml.includes('/faqs'));
check('contains no /api', !xml.includes('/api'));

const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
check('contains no query parameters', locs.every((loc) => !loc.includes('?')));
check('has no duplicate URLs', locs.length === new Set(locs).size);
check('every loc is an https URL on the canonical origin', locs.every((loc) => loc.startsWith(`${origin}/`) || loc === `${origin}/`));

if (failed) {
	console.log(`\n${failed} check(s) failed.`);
	process.exit(1);
}

console.log('\nAll sitemap checks passed.');
