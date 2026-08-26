/**
 * Verifies the shared font registry stays aligned with CSS classes,
 * and regressions for font switching + distinct rendering values.
 *
 *   node scripts/check-font-registry.js
 */
const fs = require('node:fs');
const path = require('node:path');
const { Editor } = require('@tiptap/core');
const { StarterKit } = require('@tiptap/starter-kit');
const {
	FONT_REGISTRY,
	extractFontIdsFromHtml,
	buildGoogleFontsUrl,
	isValidFontId,
	normalizeDocumentFonts,
	getFontCssClass
} = require('../../shared/content/fontRegistry');
const { BmFontFamily } = require('../src/content/bmFontFamilyExtension');
const { renderContent } = require('../src/content/renderer');

const cssPath = path.resolve(__dirname, '../../client/src/styles/bm-content-fonts.css');
const css = fs.readFileSync(cssPath, 'utf8');
const clientExtensionPath = path.resolve(
	__dirname,
	'../../client/src/components/RichEditor/extensions/bmFontFamily.ts'
);
const clientExtensionSource = fs.readFileSync(clientExtensionPath, 'utf8');
const serverExtensionPath = path.resolve(__dirname, '../src/content/bmFontFamilyExtension.js');
const serverExtensionSource = fs.readFileSync(serverExtensionPath, 'utf8');

let failed = 0;

function check(label, condition, detail = '') {
	if (condition) {
		console.log(`  PASS  ${label}`);
		return;
	}

	failed += 1;
	console.log(`  FAIL  ${label}${detail ? `\n        ${detail}` : ''}`);
}

function fontMarksOnText(docJson) {
	const marks = [];
	function walk(node) {
		if (!node || typeof node !== 'object') {
			return;
		}
		if (Array.isArray(node.marks)) {
			for (const mark of node.marks) {
				if (mark?.type === 'fontFamily') {
					marks.push(mark.attrs?.fontId || null);
				}
			}
		}
		if (Array.isArray(node.content)) {
			for (const child of node.content) {
				walk(child);
			}
		}
	}
	walk(docJson);
	return marks;
}

function createFontEditor() {
	return new Editor({
		extensions: [
			StarterKit.configure({
				heading: { levels: [1, 2, 3, 4] }
			}),
			BmFontFamily
		],
		content: {
			type: 'doc',
			content: [{ type: 'paragraph' }]
		}
	});
}

function cssFontFamilyFor(fontId) {
	const className = `bm-font-${fontId}`;
	const re = new RegExp(`\\.${className.replace(/-/g, '\\-')}\\s*\\{[^}]*font-family\\s*:\\s*([^;]+);`, 'i');
	const match = css.match(re);
	return match ? match[1].trim() : null;
}

const seenIds = new Set();
for (const font of FONT_REGISTRY) {
	check(`font ${font.id} has required metadata`, Boolean(font.id && font.label && font.cssFamily && font.category));
	check(`font ${font.id} has no duplicate id`, !seenIds.has(font.id));
	seenIds.add(font.id);
	check(
		`CSS class exists for ${font.id}`,
		css.includes(`.bm-font-${font.id}`)
	);
	check(
		`CSS class for ${font.id} is unscoped (works in toolbar + canvas)`,
		new RegExp(`(^|\\n)\\.bm-font-${font.id.replace(/-/g, '\\-')}\\s*\\{`).test(css)
	);
	check(`getFontCssClass matches ${font.id}`, getFontCssClass(font.id) === `bm-font-${font.id}`);
	check(
		`CSS declares a font-family for ${font.id}`,
		Boolean(cssFontFamilyFor(font.id))
	);
}

const FEATURED_FONT_IDS = ['inter', 'roboto', 'open-sans', 'lato', 'merriweather', 'georgia', 'montserrat', 'poppins', 'playfair-display'];

for (const fontId of FEATURED_FONT_IDS) {
	const rendered = renderContent({
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						marks: [{ type: 'fontFamily', attrs: { fontId } }],
						text: fontId
					}
				]
			}
		]
	});

	const className = `bm-font-${fontId}`;
	check(
		`renderContent emits span for ${fontId}`,
		rendered.contentHtml.includes(`data-font="${fontId}"`)
			&& rendered.contentHtml.includes(className)
	);
	check(
		`normalizeDocumentFonts keeps ${fontId}`,
		normalizeDocumentFonts({
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							marks: [{ type: 'fontFamily', attrs: { fontId } }],
							text: 'x'
						}
					]
				}
			]
		}).content[0].content[0].marks[0].attrs.fontId === fontId
	);
}

check('registry rejects unknown font ids', !isValidFontId('comic-sans'));
check(
	'extractFontIdsFromHtml finds data-font and class references',
	extractFontIdsFromHtml('<p><span data-font="inter" class="bm-font-inter">Hi</span></p>').includes('inter')
);
check(
	'buildGoogleFontsUrl skips system fonts',
	buildGoogleFontsUrl(['georgia', 'arial']) === null
);
check(
	'buildGoogleFontsUrl includes web fonts',
	Boolean(buildGoogleFontsUrl(['inter', 'georgia'])?.includes('family=Inter'))
);
check(
	'invalid font marks are stripped before render',
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

// Distinct rendering values — different fonts must not collapse to one CSS family.
const robotoFamily = cssFontFamilyFor('roboto');
const georgiaFamily = cssFontFamilyFor('georgia');
const merriweatherFamily = cssFontFamilyFor('merriweather');
const interFamily = cssFontFamilyFor('inter');
check(
	'different fonts resolve to different CSS font-family values (roboto ≠ georgia)',
	Boolean(robotoFamily && georgiaFamily && robotoFamily !== georgiaFamily),
	`roboto=${robotoFamily} georgia=${georgiaFamily}`
);
check(
	'different fonts resolve to different CSS font-family values (inter ≠ merriweather)',
	Boolean(interFamily && merriweatherFamily && interFamily !== merriweatherFamily),
	`inter=${interFamily} merriweather=${merriweatherFamily}`
);

// Legacy stacked marks must collapse to the latest selection on normalize/save.
const collapsed = normalizeDocumentFonts({
	type: 'doc',
	content: [
		{
			type: 'paragraph',
			content: [
				{
					type: 'text',
					marks: [
						{ type: 'bold' },
						{ type: 'fontFamily', attrs: { fontId: 'roboto' } },
						{ type: 'fontFamily', attrs: { fontId: 'merriweather' } },
						{ type: 'fontFamily', attrs: { fontId: 'georgia' } }
					],
					text: 'stacked'
				}
			]
		}
	]
});
const collapsedMarks = collapsed.content[0].content[0].marks;
const collapsedFontMarks = collapsedMarks.filter((mark) => mark.type === 'fontFamily');
check(
	'normalizeDocumentFonts collapses stacked fontFamily marks to one',
	collapsedFontMarks.length === 1,
	`got ${collapsedFontMarks.length}`
);
check(
	'normalizeDocumentFonts keeps the latest stacked fontId',
	collapsedFontMarks[0]?.attrs?.fontId === 'georgia'
);
check(
	'normalizeDocumentFonts preserves non-font marks while collapsing fonts',
	collapsedMarks.some((mark) => mark.type === 'bold')
);

// Extension must not disable self-exclusion (root cause of switch-after-type bug).
check(
	'client BmFontFamily does not disable mark self-exclusion',
	!/^\s*excludes\s*:\s*['"]{2}/m.test(clientExtensionSource)
);
check(
	'server BmFontFamily does not disable mark self-exclusion',
	!/^\s*excludes\s*:\s*['"]{2}/m.test(serverExtensionSource)
);

/** Insert plain text via ProseMirror so headless Node tests need no DOM parser. */
function typeText(editor, text) {
	return editor
		.chain()
		.focus()
		.command(({ tr, dispatch }) => {
			if (dispatch) {
				tr.insertText(text);
			}
			return true;
		})
		.run();
}

// Regression: after selecting a font and typing, selecting a second font must replace.
{
	const editor = createFontEditor();
	editor.commands.focus('end');
	editor.commands.setFontFamily('roboto');
	typeText(editor, 'This is Roboto text');

	const afterFirst = fontMarksOnText(editor.getJSON());
	check(
		'after select roboto + type, document has roboto marks only',
		afterFirst.length > 0 && afterFirst.every((id) => id === 'roboto'),
		`marks=${JSON.stringify(afterFirst)}`
	);

	editor.commands.setFontFamily('georgia');
	const storedAfterSwitch = editor.state.storedMarks || [];
	const storedFont = storedAfterSwitch.find((mark) => mark.type.name === 'fontFamily');
	check(
		'REGRESSION: switching font at caret updates storedMarks to the new font',
		storedFont?.attrs?.fontId === 'georgia',
		`stored=${JSON.stringify(storedAfterSwitch.map((m) => ({ type: m.type.name, fontId: m.attrs?.fontId })))}`
	);
	typeText(editor, ' This is Georgia text');

	const json = editor.getJSON();
	const allFontMarks = fontMarksOnText(json);
	const uniqueFonts = [...new Set(allFontMarks)];
	check(
		'REGRESSION: after typing, selecting a second font continues to work',
		uniqueFonts.includes('georgia'),
		`uniqueFonts=${JSON.stringify(uniqueFonts)}`
	);

	// No text node should carry more than one fontFamily mark.
	let stacked = false;
	function walkForStack(node) {
		if (!node || typeof node !== 'object') {
			return;
		}
		if (Array.isArray(node.marks)) {
			const fonts = node.marks.filter((mark) => mark?.type === 'fontFamily');
			if (fonts.length > 1) {
				stacked = true;
			}
		}
		if (Array.isArray(node.content)) {
			for (const child of node.content) {
				walkForStack(child);
			}
		}
	}
	walkForStack(json);
	check(
		'REGRESSION: font switches replace marks (never stack multiple fontFamily)',
		!stacked
	);

	const rendered = renderContent(json);
	const html = rendered.contentHtml;
	check(
		'REGRESSION: serialized HTML contains distinct font markers for roboto and georgia',
		html.includes('data-font="roboto"') && html.includes('data-font="georgia"'),
		html
	);
	check(
		'REGRESSION: serialized HTML uses distinct bm-font classes',
		html.includes('bm-font-roboto') && html.includes('bm-font-georgia'),
		html
	);

	editor.destroy();
}

// Repeated switching after typing must never stick on the first font.
{
	const sequence = ['inter', 'roboto', 'georgia', 'lato', 'merriweather', 'open-sans', 'montserrat', 'poppins'];
	const editor = createFontEditor();
	editor.commands.focus('end');

	for (const fontId of sequence) {
		editor.commands.setFontFamily(fontId);
		typeText(editor, ` ${fontId}`);
	}

	const marks = fontMarksOnText(editor.getJSON());
	const unique = [...new Set(marks)];
	check(
		'REGRESSION: repeated font switching after typing applies every selected font',
		sequence.every((id) => unique.includes(id)),
		`expected all of ${sequence.join(', ')}; got ${unique.join(', ')}`
	);

	let stacked = false;
	function walk(node) {
		if (!node || typeof node !== 'object') {
			return;
		}
		if (Array.isArray(node.marks)) {
			if (node.marks.filter((mark) => mark?.type === 'fontFamily').length > 1) {
				stacked = true;
			}
		}
		if (Array.isArray(node.content)) {
			node.content.forEach(walk);
		}
	}
	walk(editor.getJSON());
	check('REGRESSION: multi-switch sequence never stacks fontFamily marks', !stacked);

	editor.destroy();
}

// Changing font on an existing selection must replace, not stack.
{
	const editor = createFontEditor();
	editor.commands.setContent({
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						marks: [{ type: 'fontFamily', attrs: { fontId: 'roboto' } }],
						text: 'Hello World'
					}
				]
			}
		]
	});
	editor.commands.setTextSelection({ from: 1, to: 12 });
	editor.commands.setFontFamily('georgia');

	const marks = fontMarksOnText(editor.getJSON());
	check(
		'selecting existing text and changing font replaces fontId',
		marks.length > 0 && marks.every((id) => id === 'georgia'),
		`marks=${JSON.stringify(marks)}`
	);
	check(
		'existing-text font change does not stack marks',
		marks.filter((id) => id === 'roboto').length === 0
	);
	editor.destroy();
}

// Bold + font must coexist; only font changes.
{
	const editor = createFontEditor();
	editor.commands.setContent({
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						marks: [
							{ type: 'bold' },
							{ type: 'fontFamily', attrs: { fontId: 'inter' } }
						],
						text: 'Bold Inter'
					}
				]
			}
		]
	});
	editor.commands.setTextSelection({ from: 1, to: 11 });
	editor.commands.setFontFamily('lato');

	const para = editor.getJSON().content[0].content[0];
	const types = para.marks.map((mark) => mark.type).sort();
	check(
		'font change preserves bold mark',
		types.includes('bold') && types.includes('fontFamily')
	);
	check(
		'font change updates fontId while preserving other formatting',
		para.marks.find((mark) => mark.type === 'fontFamily')?.attrs?.fontId === 'lato'
	);
	editor.destroy();
}

console.log(failed === 0 ? '\nFont registry checks passed.' : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
