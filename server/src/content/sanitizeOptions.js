const sanitizeHtml = require('sanitize-html');
const { isValidFontId, getFontCssClass } = require('../../../shared/content/fontRegistry');
const { isExternalLink } = require('../../../shared/content/linkUtils');

function sanitizeFontSpanAttribs(attribs) {
	const next = { ...attribs };
	const fontId = next['data-font'];

	if (fontId && !isValidFontId(fontId)) {
		delete next['data-font'];
	}

	if (typeof next.class === 'string') {
		const classes = next.class.split(/\s+/).filter(Boolean).filter((className) => {
			if (!className.startsWith('bm-font-')) {
				return true;
			}

			const id = className.slice('bm-font-'.length);
			return isValidFontId(id);
		});

		if (classes.length > 0) {
			next.class = classes.join(' ');
		} else {
			delete next.class;
		}
	}

	const resolvedFontId = isValidFontId(next['data-font']) ? next['data-font'] : null;
	if (resolvedFontId) {
		next['data-font'] = resolvedFontId;
		const fontClass = getFontCssClass(resolvedFontId);
		const classSet = new Set((next.class || '').split(/\s+/).filter(Boolean));
		if (fontClass) {
			classSet.add(fontClass);
		}
		next.class = [...classSet].join(' ');
	} else {
		delete next['data-font'];
	}

	return next;
}

/**
 * The sanitiser runs on server-generated HTML, so this list only needs to cover
 * what the content schema can produce. It exists to neutralise anything smuggled
 * in through a node attribute, not to police the editor.
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
		img: ['src', 'alt', 'title', 'width', 'height', 'class', 'loading', 'decoding', 'data-align'],
		figure: ['class', 'data-layout', 'data-align', 'data-spacing'],
		figcaption: ['class'],
		iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'title', 'class', 'start'],
		input: ['type', 'checked', 'disabled'],
		th: ['colspan', 'rowspan', 'colwidth', 'style', 'class'],
		td: ['colspan', 'rowspan', 'colwidth', 'style', 'class'],
		col: ['style', 'width'],
		'*': ['class', 'data-type', 'data-variant', 'data-checked', 'data-align', 'data-layout', 'data-spacing', 'data-font', 'style']
	},
	// Stated explicitly rather than inherited: the library's default list has varied
	// between releases, and `col` in particular decides whether tables serialise as
	// `<col />` or `<col></col>`, which would rewrite the markup of every article.
	selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta', 'col'],
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
			'min-width': [/^\d+(?:\.\d+)?(px|%)$/],
			'max-width': [/^\d+(?:\.\d+)?(px|%)$/],
			height: [/^(auto|\d+(?:\.\d+)?(px|%))$/]
		}
	},
	transformTags: {
		a: (tagName, attribs) => {
			const href = attribs.href || '';
			const next = { ...attribs };
			if (!next.class) {
				next.class = 'bm-content-link';
			}
			if (isExternalLink(href)) {
				next.target = '_blank';
				next.rel = 'noopener noreferrer nofollow';
			} else {
				delete next.target;
				delete next.rel;
			}
			return { tagName, attribs: next };
		},
		span: (tagName, attribs) => ({
			tagName,
			attribs: sanitizeFontSpanAttribs(attribs)
		})
	}
};

module.exports = { SANITIZE_OPTIONS };
