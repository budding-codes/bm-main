/**
 * Link URL validation regression checks.
 *
 *   npm run check:link
 */
const {
	sanitizeLinkUrl,
	validateLinkUrl,
	isExternalLink,
	buildLinkHtmlAttributes
} = require('../../shared/content/linkUtils');
const { normalizeDocumentLinks } = require('../src/content/normalizeDocumentLinks');
const { renderContent } = require('../src/content/renderer');

let failed = 0;

function check(label, condition, detail = '') {
	if (condition) {
		console.log(`  PASS  ${label}`);
		return;
	}
	failed += 1;
	console.log(`  FAIL  ${label}${detail ? `\n        ${detail}` : ''}`);
}

check('https URLs are accepted', sanitizeLinkUrl('https://example.com/page') === 'https://example.com/page');
check('http URLs are accepted', sanitizeLinkUrl('http://example.com') === 'http://example.com/');
check('bare domains normalize to https', sanitizeLinkUrl('example.com/path') === 'https://example.com/path');
check('relative paths are accepted', sanitizeLinkUrl('/blog/post') === '/blog/post');
check('hash links are accepted', sanitizeLinkUrl('#section-1') === '#section-1');
check('mailto links are accepted', sanitizeLinkUrl('mailto:hello@example.com') === 'mailto:hello@example.com');
check('tel links are accepted', sanitizeLinkUrl('tel:+1-555-0100') === 'tel:+1-555-0100');

check('javascript URLs are blocked', sanitizeLinkUrl('javascript:alert(1)') === null);
check('data URLs are blocked', sanitizeLinkUrl('data:text/html,<script>alert(1)</script>') === null);
check('protocol-relative URLs are blocked', sanitizeLinkUrl('//evil.com') === null);

check('external links are detected', isExternalLink('https://example.com'));
check('internal links are not external', !isExternalLink('/about'));
check('hash links are not external', !isExternalLink('#top'));

const externalAttrs = buildLinkHtmlAttributes('https://example.com');
check(
	'external link attrs include target blank',
	externalAttrs?.target === '_blank' && externalAttrs.rel === 'noopener noreferrer nofollow'
);

const internalAttrs = buildLinkHtmlAttributes('/blog/post');
check(
	'internal link attrs omit target blank',
	internalAttrs?.href === '/blog/post' && !internalAttrs.target && !internalAttrs.rel
);

const invalid = validateLinkUrl('javascript:alert(1)');
check('invalid URLs return an error message', !invalid.valid && Boolean(invalid.error));

const maliciousDoc = normalizeDocumentLinks({
	type: 'doc',
	content: [
		{
			type: 'paragraph',
			content: [
				{
					type: 'text',
					marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
					text: 'unsafe'
				}
			]
		},
		{
			type: 'image',
			attrs: {
				src: 'https://res.cloudinary.com/demo/image/upload/bm-blog/images/a.jpg',
				alt: 'Ship',
				href: 'javascript:alert(1)'
			}
		}
	]
});

check(
	'malicious text links are stripped from JSON',
	!JSON.stringify(maliciousDoc).includes('javascript:')
);

const linkedImage = renderContent({
	type: 'doc',
	content: [
		{
			type: 'image',
			attrs: {
				src: 'https://res.cloudinary.com/demo/image/upload/bm-blog/images/a.jpg',
				alt: 'Ship',
				href: 'https://example.com'
			}
		}
	]
});

check('linked image renders anchor wrapper', linkedImage.contentHtml.includes('class="bm-content-link"') && linkedImage.contentHtml.includes('<img class="bm-content-image"'));
check('linked image preserves img tag', linkedImage.contentHtml.includes('alt="Ship"'));

const internalLink = renderContent({
	type: 'doc',
	content: [
		{
			type: 'paragraph',
			content: [
				{
					type: 'text',
					marks: [{ type: 'link', attrs: { href: '/blog/post' } }],
					text: 'internal'
				}
			]
		}
	]
});

check('internal text link renders without target blank', internalLink.contentHtml.includes('href="/blog/post"'));
check('internal text link omits rel nofollow', !internalLink.contentHtml.includes('rel="noopener noreferrer nofollow"'));

console.log(failed === 0 ? '\nLink utilities are healthy.' : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
