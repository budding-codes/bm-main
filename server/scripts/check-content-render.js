/**
 * Golden-output test for the content pipeline.
 *
 * The expected HTML below was captured from the original renderer, so this pins
 * the published markup across renderer, sanitiser and extension upgrades. A
 * difference here changes every article on the site, so it must be reviewed
 * deliberately rather than accepted silently.
 *
 *   npm run check:content
 */
const { renderContent } = require('../src/content/renderer');

const DOCUMENT = {
	type: 'doc',
	content: [
		{ type: 'heading', attrs: { level: 2, textAlign: 'center' }, content: [{ type: 'text', text: 'Admissions 2026' }] },
		{
			type: 'paragraph',
			content: [
				{ type: 'text', text: 'Plain ' },
				{ type: 'text', marks: [{ type: 'bold' }], text: 'bold' },
				{ type: 'text', text: ' ' },
				{ type: 'text', marks: [{ type: 'italic' }], text: 'italic' },
				{ type: 'text', text: ' ' },
				{ type: 'text', marks: [{ type: 'strike' }], text: 'strike' },
				{ type: 'text', text: ' ' },
				{ type: 'text', marks: [{ type: 'code' }], text: 'code' },
				{ type: 'text', text: ' ' },
				{ type: 'text', marks: [{ type: 'highlight' }], text: 'highlight' },
				{ type: 'text', text: ' ' },
				{ type: 'text', marks: [{ type: 'subscript' }], text: 'sub' },
				{ type: 'text', marks: [{ type: 'superscript' }], text: 'sup' },
				{ type: 'text', text: ' ' },
				{ type: 'text', marks: [{ type: 'link', attrs: { href: 'https://buddingmariners.com' } }], text: 'link' },
				{ type: 'text', text: ' & <escaped> "quotes"' }
			]
		},
		{ type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bullet' }] }] }] },
		{ type: 'orderedList', attrs: { start: 3 }, content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ordered' }] }] }] },
		{ type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task' }] }] }] },
		{ type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Quote' }] }] },
		{ type: 'codeBlock', attrs: { language: 'js' }, content: [{ type: 'text', text: 'const a = 1;' }] },
		{ type: 'horizontalRule' },
		{ type: 'image', attrs: { src: 'https://res.cloudinary.com/demo/image/upload/bm-blog/images/a.jpg', alt: 'Ship' } },
		{ type: 'youtube', attrs: { src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } },
		{
			type: 'table',
			content: [
				{
					type: 'tableRow',
					content: [
						{ type: 'tableHeader', attrs: { colspan: 1, rowspan: 1, colwidth: [120] }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'H' }] }] },
						{ type: 'tableCell', attrs: { colspan: 1, rowspan: 1, colwidth: null }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'C' }] }] }
					]
				}
			]
		},
		{ type: 'callout', attrs: { variant: 'warning' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Careful' }] }] },
		{ type: 'paragraph', content: [{ type: 'hardBreak' }, { type: 'text', text: 'after break' }] }
	]
};

const EXPECTED_HTML = '<h2 style="text-align:center">Admissions 2026</h2>'
	+ '<p>Plain <strong>bold</strong> <em>italic</em> <s>strike</s> <code>code</code> <mark>highlight</mark> '
	+ '<sub>sub</sub><sup>sup</sup> <a target="_blank" rel="noopener noreferrer nofollow" class="bm-content-link" '
	+ 'href="https://buddingmariners.com/">link</a> &amp; &lt;escaped&gt; "quotes"</p>'
	+ '<ul><li><p>Bullet</p></li></ul><ol><li><p>Ordered</p></li></ol>'
	+ '<ul class="bm-content-task-list" data-type="taskList"><li data-checked="true" data-type="taskItem">'
	+ '<label><input type="checkbox" checked="checked" /><span></span></label><div><p>Task</p></div></li></ul>'
	+ '<blockquote><p>Quote</p></blockquote>'
	+ '<pre class="bm-content-code-block"><code class="language-js">const a = 1;</code></pre><hr />'
	+ '<img class="bm-content-image" loading="lazy" decoding="async" '
	+ 'src="https://res.cloudinary.com/demo/image/upload/bm-blog/images/a.jpg" alt="Ship" />'
	+ '<div><iframe class="bm-content-embed" width="640" height="480" allowfullscreen="true" '
	+ 'src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=1" start="0"></iframe></div>'
	+ '<div class="tableWrapper"><table class="bm-content-table" style="min-width:145px"><colgroup><col style="width:120px" />'
	+ '<col style="min-width:25px" /></colgroup><tbody><tr><th colspan="1" rowspan="1" colwidth="120"><p>H</p></th>'
	+ '<td colspan="1" rowspan="1"><p>C</p></td></tr></tbody></table></div>'
	+ '<div data-variant="warning" data-type="callout" class="bm-content-callout"><p>Careful</p></div>'
	+ '<p><br />after break</p>';

const result = renderContent(DOCUMENT);
let failed = 0;

function check(label, condition, detail = '') {
	if (condition) {
		console.log(`  PASS  ${label}`);
		return;
	}

	failed += 1;
	console.log(`  FAIL  ${label}${detail ? `\n        ${detail}` : ''}`);
}

check('rendered HTML matches the expected output', result.contentHtml === EXPECTED_HTML);

if (result.contentHtml !== EXPECTED_HTML) {
	for (let i = 0; i < Math.max(EXPECTED_HTML.length, result.contentHtml.length); i += 1) {
		if (EXPECTED_HTML[i] !== result.contentHtml[i]) {
			console.log(`\n        first difference at index ${i}`);
			console.log(`        expected: ${JSON.stringify(EXPECTED_HTML.slice(Math.max(0, i - 60), i + 100))}`);
			console.log(`        actual:   ${JSON.stringify(result.contentHtml.slice(Math.max(0, i - 60), i + 100))}`);
			break;
		}
	}
}

check('script tags are stripped', !renderContent({
	type: 'doc',
	content: [{ type: 'paragraph', content: [{ type: 'text', text: '<script>alert(1)</script>' }] }]
}).contentHtml.includes('<script'));

check('plain text is derived', result.contentText.includes('Admissions 2026'));
check('word count is populated', result.wordCount > 0);
check('cloudinary ids are collected', result.mediaPublicIds.includes('bm-blog/images/a'));

const imageResult = renderContent({
	type: 'doc',
	content: [
		{
			type: 'image',
			attrs: {
				src: 'https://res.cloudinary.com/demo/image/upload/bm-blog/images/ship.jpg',
				alt: 'Training vessel',
				width: 480,
				height: 320,
				align: 'center',
				layout: 'wrap-left',
				caption: 'Cadets on deck',
				spacing: 'large'
			}
		}
	]
});

check('image figure renders with layout attrs', imageResult.contentHtml.includes('bm-content-image-figure--layout-wrap-left'));
check('image figure renders caption', imageResult.contentHtml.includes('<figcaption class="bm-content-image-caption">Cadets on deck</figcaption>'));
check('image figure renders spacing class', imageResult.contentHtml.includes('bm-content-image-figure--spacing-large'));
check('image width is preserved', imageResult.contentHtml.includes('width="480"'));
check('image alt is preserved', imageResult.contentHtml.includes('alt="Training vessel"'));

const wrapRightResult = renderContent({
	type: 'doc',
	content: [
		{
			type: 'paragraph',
			content: [{ type: 'text', text: 'Text beside the image.' }]
		},
		{
			type: 'image',
			attrs: {
				src: 'https://res.cloudinary.com/demo/image/upload/bm-blog/images/ship.jpg',
				alt: 'Training vessel',
				width: 320,
				height: 240,
				layout: 'wrap-right'
			}
		},
		{
			type: 'paragraph',
			content: [{ type: 'text', text: 'More wrapped text.' }]
		}
	]
});

check(
	'wrap-right renders floated figure',
	wrapRightResult.contentHtml.includes('bm-content-image-figure--layout-wrap-right')
);
check('wrap-right preserves width', wrapRightResult.contentHtml.includes('width="320"'));
check('legacy plain image still renders', renderContent({
	type: 'doc',
	content: [{ type: 'image', attrs: { src: 'https://res.cloudinary.com/demo/image/upload/bm-blog/images/legacy.jpg', alt: 'Legacy' } }]
}).contentHtml.includes('<img class="bm-content-image"'));

const centeredListResult = renderContent({
	type: 'doc',
	content: [
		{
			type: 'bulletList',
			content: [
				{
					type: 'listItem',
					attrs: { textAlign: 'center' },
					content: [
						{
							type: 'paragraph',
							attrs: { textAlign: 'center' },
							content: [{ type: 'text', text: 'Centered bullet' }]
						}
					]
				}
			]
		}
	]
});

check(
	'centered list item keeps text-align on li and p',
	centeredListResult.contentHtml.includes('<li style="text-align:center">') &&
		centeredListResult.contentHtml.includes('<p style="text-align:center">Centered bullet</p>')
);

const justifiedParagraphResult = renderContent({
	type: 'doc',
	content: [
		{
			type: 'paragraph',
			attrs: { textAlign: 'justify' },
			content: [{ type: 'text', text: 'Justified body copy.' }]
		}
	]
});

check(
	'justified paragraph renders text-align style',
	justifiedParagraphResult.contentHtml === '<p style="text-align:justify">Justified body copy.</p>'
);

const fontFamilyResult = renderContent({
	type: 'doc',
	content: [
		{
			type: 'paragraph',
			content: [
				{ type: 'text', text: 'Default text ' },
				{
					type: 'text',
					marks: [{ type: 'fontFamily', attrs: { fontId: 'georgia' } }],
					text: 'Georgia'
				},
				{ type: 'text', text: ' and ' },
				{
					type: 'text',
					marks: [
						{ type: 'bold' },
						{ type: 'fontFamily', attrs: { fontId: 'inter' } }
					],
					text: 'bold Inter'
				}
			]
		}
	]
});

check(
	'font family mark renders controlled span',
	fontFamilyResult.contentHtml.includes('<span data-font="georgia" class="bm-font-georgia">Georgia</span>')
		|| fontFamilyResult.contentHtml.includes('<span class="bm-font-georgia" data-font="georgia">Georgia</span>')
);
check(
	'font family preserves other marks',
	fontFamilyResult.contentHtml.includes('<span data-font="inter" class="bm-font-inter"><strong>bold Inter</strong></span>')
		|| fontFamilyResult.contentHtml.includes('<span class="bm-font-inter" data-font="inter"><strong>bold Inter</strong></span>')
);
check(
	'invalid font ids are stripped during render',
	renderContent({
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						marks: [{ type: 'fontFamily', attrs: { fontId: 'evil-font; url(javascript:alert(1))' } }],
						text: 'unsafe'
					}
				]
			}
		]
	}).contentHtml === '<p>unsafe</p>'
);
check(
	'malicious font-family inline style is not emitted',
	!fontFamilyResult.contentHtml.includes('font-family:')
);

const maliciousHtml = renderContent({
	type: 'doc',
	content: [
		{
			type: 'paragraph',
			content: [{ type: 'text', text: 'safe' }]
		}
	]
}).contentHtml.replace(
	'<p>safe</p>',
	'<p><span style="font-family: Comic Sans MS" data-font="evil">nope</span></p>'
);

const sanitizeHtml = require('sanitize-html');
const { SANITIZE_OPTIONS } = require('../src/content/sanitizeOptions');
const sanitizedMalicious = sanitizeHtml(maliciousHtml, SANITIZE_OPTIONS);

check(
	'sanitizer strips unsupported font data attributes',
	!sanitizedMalicious.includes('data-font="evil"')
);

console.log(failed === 0 ? '\nContent rendering is unchanged.' : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
