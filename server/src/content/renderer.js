/**
 * HTML is produced with Tiptap's static renderer, which walks the document and the
 * extensions' own `renderHTML` definitions directly.
 *
 * The DOM-based renderer (`@tiptap/html/server`) was used previously. It pulls in
 * happy-dom, an ESM-only package, and serverless runtimes commonly start Node with
 * `--no-experimental-require-module`, where requiring an ES module from CommonJS
 * throws at import time and takes the whole process down. The static renderer has a
 * CommonJS build, needs no DOM, and drops a large dependency from the bundle.
 */
const { renderToHTMLString } = require('@tiptap/static-renderer/pm/html-string');
const { getSchema } = require('@tiptap/core');
const sanitizeHtml = require('sanitize-html');
const { contentExtensions } = require('./extensions');
const { SANITIZE_OPTIONS } = require('./sanitizeOptions');
const { normalizeDocumentFonts } = require('../../../shared/content/fontRegistry');
const { htmlToText, countWords, estimateReadingTime } = require('../utils/text');
const { badRequest } = require('../utils/httpError');

const schema = getSchema(contentExtensions);
const KNOWN_NODES = new Set(Object.keys(schema.nodes));
const KNOWN_MARKS = new Set(Object.keys(schema.marks));

const EMPTY_DOC = { type: 'doc', content: [] };

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

	const normalizedDoc = normalizeDocumentFonts(doc);

	const rawHtml = renderToHTMLString({ extensions: contentExtensions, content: normalizedDoc });
	const contentHtml = sanitizeHtml(rawHtml, SANITIZE_OPTIONS);
	const contentText = htmlToText(contentHtml);
	const wordCount = countWords(contentText);

	return {
		contentBlocks: normalizedDoc,
		contentHtml,
		contentText,
		wordCount,
		readingTimeMinutes: estimateReadingTime(wordCount),
		mediaPublicIds: [...collectMediaPublicIds(normalizedDoc)]
	};
}

module.exports = { renderContent, assertRenderable, collectMediaPublicIds, EMPTY_DOC };
