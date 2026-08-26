/**
 * Central font registry for blog rich-text content (Node / server).
 *
 * Font definitions live in fontRegistry.data.json — the single source of truth
 * shared with the browser client via client/src/lib/fontRegistry.ts.
 */

const FONT_REGISTRY = require('./fontRegistry.data.json');

const FONT_BY_ID = new Map(FONT_REGISTRY.map((font) => [font.id, font]));
const FONT_IDS = new Set(FONT_REGISTRY.map((font) => font.id));
const FONT_CLASS_PREFIX = 'bm-font-';

/**
 * Default body typography for blogs without an explicit font mark.
 * Matches `.bm-blog-content` in bm-content.css.
 */
const DEFAULT_BODY_FONT_ID = 'georgia';

function isValidFontId(value) {
	return typeof value === 'string' && FONT_IDS.has(value);
}

function normalizeFontId(value) {
	return isValidFontId(value) ? value : null;
}

function getFontById(id) {
	return FONT_BY_ID.get(id) || null;
}

function getFontCssClass(id) {
	return isValidFontId(id) ? `${FONT_CLASS_PREFIX}${id}` : null;
}

function getFeaturedFonts() {
	return FONT_REGISTRY.filter((font) => font.featured);
}

function getFontsByCategory(category) {
	return FONT_REGISTRY.filter((font) => font.category === category);
}

function getGoogleFontFamilies(fontIds) {
	const families = [];
	for (const id of fontIds) {
		const font = getFontById(id);
		if (font?.googleFont) {
			const weights = [...new Set(font.googleFont.weights)].sort((a, b) => a - b);
			families.push({
				family: font.googleFont.family,
				weights
			});
		}
	}
	return families;
}

/**
 * Builds a single Google Fonts CSS URL for the given font IDs.
 * Returns null when no web fonts are required.
 */
function buildGoogleFontsUrl(fontIds) {
	const families = getGoogleFontFamilies(fontIds);
	if (families.length === 0) {
		return null;
	}

	const params = families.map(({ family, weights }) => {
		const encoded = encodeURIComponent(family);
		return `family=${encoded}:wght@${weights.join(';')}`;
	});

	return `https://fonts.googleapis.com/css2?${params.join('&')}&display=swap`;
}

/**
 * Builds a Google Fonts URL for editor dropdown previews (all non-system fonts).
 */
function buildEditorPreviewFontsUrl() {
	const googleIds = FONT_REGISTRY.filter((font) => font.googleFont).map((font) => font.id);
	return buildGoogleFontsUrl(googleIds);
}

const FONT_ID_HTML_PATTERN = /data-font="([^"]+)"|class="[^"]*\bbm-font-([a-z0-9-]+)\b/g;

function extractFontIdsFromHtml(html) {
	if (typeof html !== 'string' || !html) {
		return [];
	}

	const found = new Set();
	let match = FONT_ID_HTML_PATTERN.exec(html);
	while (match) {
		const id = normalizeFontId(match[1] || match[2]);
		if (id) {
			found.add(id);
		}
		match = FONT_ID_HTML_PATTERN.exec(html);
	}

	return [...found];
}

function isPlainObject(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Collects font IDs referenced in a Tiptap document's fontFamily marks.
 */
function extractFontIdsFromDoc(node, found = new Set()) {
	if (!isPlainObject(node)) {
		return [...found];
	}

	if (Array.isArray(node.marks)) {
		for (const mark of node.marks) {
			if (isPlainObject(mark) && mark.type === 'fontFamily' && isValidFontId(mark.attrs?.fontId)) {
				found.add(mark.attrs.fontId);
			}
		}
	}

	if (Array.isArray(node.content)) {
		for (const child of node.content) {
			extractFontIdsFromDoc(child, found);
		}
	}

	return [...found];
}

/**
 * Walks a Tiptap document and strips or normalizes invalid fontFamily marks.
 * If multiple fontFamily marks were stacked (legacy excludes:'' bug), keep only
 * the last valid one so save/render matches the latest user selection.
 */
function normalizeDocumentFonts(node) {
	if (!isPlainObject(node)) {
		return node;
	}

	const next = { ...node };

	if (Array.isArray(node.marks)) {
		const kept = [];
		let lastFontFamily = null;

		for (const mark of node.marks) {
			if (!isPlainObject(mark) || mark.type !== 'fontFamily') {
				kept.push(mark);
				continue;
			}

			const fontId = normalizeFontId(mark.attrs?.fontId);
			if (!fontId) {
				continue;
			}

			lastFontFamily = { ...mark, attrs: { fontId } };
		}

		if (lastFontFamily) {
			kept.push(lastFontFamily);
		}

		next.marks = kept;
	}

	if (Array.isArray(node.content)) {
		next.content = node.content.map((child) => normalizeDocumentFonts(child));
	}

	return next;
}

module.exports = {
	FONT_REGISTRY,
	FONT_IDS,
	FONT_BY_ID,
	FONT_CLASS_PREFIX,
	DEFAULT_BODY_FONT_ID,
	isValidFontId,
	normalizeFontId,
	getFontById,
	getFontCssClass,
	getFeaturedFonts,
	getFontsByCategory,
	buildGoogleFontsUrl,
	buildEditorPreviewFontsUrl,
	extractFontIdsFromHtml,
	extractFontIdsFromDoc,
	normalizeDocumentFonts
};
