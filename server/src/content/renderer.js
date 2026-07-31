const { generateHTML } = require('@tiptap/html/server');
const { getSchema } = require('@tiptap/core');
const sanitizeHtml = require('sanitize-html');
const { contentExtensions } = require('./extensions');
const { htmlToText, countWords, estimateReadingTime } = require('../utils/text');
const { badRequest } = require('../utils/httpError');

const schema = getSchema(contentExtensions);
const KNOWN_NODES = new Set(Object.keys(schema.nodes));
const KNOWN_MARKS = new Set(Object.keys(schema.marks));

const EMPTY_DOC = { type: 'doc', content: [] };

/**
 * The sanitiser runs on server-generated HTML, so this list only needs to cover
 * what the schema above can produce. It exists to neutralise anything smuggled in
 * through a node attribute, not to police the editor.
 */
const SANITIZE_OPTIONS = {
	allowedTags: [
		'p', 'br', 'hr', 'div', 'span',
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
		'strong', 'em', 'u', 's', 'code', 'pre', 'mark', 'sub', 'sup',
		'ul', 'ol', 'li', 'blockquote',
		'a', 'img', 'iframe',
		'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col',
		'label', 'input', 'figure', 'figcaption'
	],
	allowedAttributes: {
		a: ['href', 'title', 'target', 'rel', 'class'],
		img: ['src', 'alt', 'title', 'width', 'height', 'class', 'loading', 'decoding'],
		iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'title', 'class', 'start'],
		input: ['type', 'checked', 'disabled'],
		th: ['colspan', 'rowspan', 'colwidth', 'style', 'class'],
		td: ['colspan', 'rowspan', 'colwidth', 'style', 'class'],
		col: ['style', 'width'],
		'*': ['class', 'data-type', 'data-variant', 'data-checked', 'data-align', 'style']
	},
	allowedSchemes: ['https', 'http', 'mailto', 'tel'],
	allowedSchemesByTag: { img: ['https', 'http'] },
	// Only these hosts may be framed, so a crafted attribute cannot embed anything.
	allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
	allowIframeRelativeUrls: false,
	// Inline styles are limited to the alignment and column widths the editor sets.
	allowedStyles: {
		'*': {
			'text-align': [/^(left|right|center|justify)$/],
			width: [/^\d+(?:\.\d+)?(px|%)$/],
			'min-width': [/^\d+(?:\.\d+)?(px|%)$/]
		}
	},
	transformTags: {
		a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }, true)
	}
};

function isPlainObject(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Walks the document and collects any node or mark type the schema does not know,
 * so an editor/server mismatch surfaces as a clear 400 instead of thrown internals
 * or silently discarded content.
 */
function findUnknownTypes(node, unknown = { nodes: new Set(), marks: new Set() }) {
	if (!isPlainObject(node)) {
		return unknown;
	}

	if (typeof node.type === 'string' && !KNOWN_NODES.has(node.type)) {
		unknown.nodes.add(node.type);
	}

	if (Array.isArray(node.marks)) {
		for (const mark of node.marks) {
			if (isPlainObject(mark) && typeof mark.type === 'string' && !KNOWN_MARKS.has(mark.type)) {
				unknown.marks.add(mark.type);
			}
		}
	}

	if (Array.isArray(node.content)) {
		for (const child of node.content) {
			findUnknownTypes(child, unknown);
		}
	}

	return unknown;
}

function assertRenderable(doc) {
	if (!isPlainObject(doc) || doc.type !== 'doc') {
		throw badRequest('Content must be a Tiptap document.');
	}

	const { nodes, marks } = findUnknownTypes(doc);
	if (nodes.size > 0 || marks.size > 0) {
		const parts = [
			nodes.size > 0 ? `nodes: ${[...nodes].join(', ')}` : '',
			marks.size > 0 ? `marks: ${[...marks].join(', ')}` : ''
		].filter(Boolean).join('; ');

		throw badRequest(`Content contains types this server cannot render (${parts}).`);
	}
}

/** Collects the Cloudinary public IDs referenced by images and links in a document. */
function collectMediaPublicIds(node, found = new Set()) {
	if (!isPlainObject(node)) {
		return found;
	}

	const src = node.attrs?.src;
	if (typeof src === 'string') {
		const match = src.match(/\/(?:image|video|raw)\/upload\/(?:[^/]+\/)*?(bm-blog\/[^.\s"?]+)/);
		if (match) {
			found.add(match[1]);
		}
	}

	if (Array.isArray(node.content)) {
		for (const child of node.content) {
			collectMediaPublicIds(child, found);
		}
	}

	return found;
}

/**
 * Turns a Tiptap document into every derived representation the app stores.
 *
 * This is the only place HTML is produced. Callers must never accept `contentHtml`
 * from a client, which is what guarantees the JSON and the HTML cannot diverge.
 */
function renderContent(contentBlocks) {
	const doc = contentBlocks || EMPTY_DOC;

	if (!isPlainObject(contentBlocks) || !Array.isArray(contentBlocks.content) || contentBlocks.content.length === 0) {
		return {
			contentBlocks: isPlainObject(contentBlocks) ? contentBlocks : null,
			contentHtml: '',
			contentText: '',
			wordCount: 0,
			readingTimeMinutes: 0,
			mediaPublicIds: []
		};
	}

	assertRenderable(doc);

	const rawHtml = generateHTML(doc, contentExtensions);
	const contentHtml = sanitizeHtml(rawHtml, SANITIZE_OPTIONS);
	const contentText = htmlToText(contentHtml);
	const wordCount = countWords(contentText);

	return {
		contentBlocks: doc,
		contentHtml,
		contentText,
		wordCount,
		readingTimeMinutes: estimateReadingTime(wordCount),
		mediaPublicIds: [...collectMediaPublicIds(doc)]
	};
}

module.exports = { renderContent, assertRenderable, collectMediaPublicIds, EMPTY_DOC };
