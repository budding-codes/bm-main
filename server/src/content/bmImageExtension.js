const { Image } = require('@tiptap/extension-image');
const { mergeAttributes } = require('@tiptap/core');

const IMAGE_MIN_WIDTH = 80;
const IMAGE_MAX_WIDTH = 1200;
const IMAGE_ALIGNMENTS = new Set(['left', 'center', 'right']);

function isImageAlignment(value) {
	return typeof value === 'string' && IMAGE_ALIGNMENTS.has(value);
}

function normalizeImageWidth(value) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return null;
	}
	return Math.round(Math.min(IMAGE_MAX_WIDTH, Math.max(IMAGE_MIN_WIDTH, parsed)));
}

function parseNumericAttr(value) {
	if (!value) {
		return null;
	}
	const parsed = Number.parseInt(String(value), 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseAlign(element) {
	const direct = element.getAttribute('data-align');
	if (isImageAlignment(direct)) {
		return direct;
	}

	for (const className of element.classList) {
		if (className.startsWith('bm-content-image--align-')) {
			const align = className.replace('bm-content-image--align-', '');
			if (isImageAlignment(align)) {
				return align;
			}
		}
	}

	const parentAlign = element.parentElement?.getAttribute('data-align');
	return isImageAlignment(parentAlign) ? parentAlign : null;
}

function buildImageStyle(width) {
	if (!width) {
		return undefined;
	}
	return `width: ${width}px; max-width: 100%; height: auto;`;
}

function buildImageClassName(align) {
	const classes = ['bm-content-image'];
	if (isImageAlignment(align)) {
		classes.push(`bm-content-image--align-${align}`);
	}
	return classes.join(' ');
}

const BmImage = Image.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			width: {
				default: null,
				parseHTML: (element) => {
					const width =
						parseNumericAttr(element.getAttribute('width')) ||
						parseNumericAttr(element.style.width.replace('px', ''));
					return normalizeImageWidth(width);
				},
				renderHTML: (attributes) => {
					const width = normalizeImageWidth(attributes.width);
					if (!width) {
						return {};
					}
					return {
						width,
						style: buildImageStyle(width)
					};
				}
			},
			height: {
				default: null,
				parseHTML: (element) => parseNumericAttr(element.getAttribute('height')),
				renderHTML: (attributes) => {
					const height = normalizeImageWidth(attributes.height);
					if (!height) {
						return {};
					}
					return { height };
				}
			},
			align: {
				default: null,
				parseHTML: (element) => parseAlign(element),
				renderHTML: (attributes) => {
					if (!isImageAlignment(attributes.align)) {
						return {};
					}
					return {
						'data-align': attributes.align,
						class: `bm-content-image--align-${attributes.align}`
					};
				}
			}
		};
	},

	parseHTML() {
		return [
			{ tag: 'figure.bm-content-image-figure img[src]' },
			{
				tag: 'img[src]',
				getAttrs: () => null
			}
		];
	},

	renderHTML({ node, HTMLAttributes }) {
		const align =
			(node && isImageAlignment(node.attrs.align) && node.attrs.align) ||
			(isImageAlignment(HTMLAttributes.align) && HTMLAttributes.align) ||
			(isImageAlignment(HTMLAttributes['data-align']) && HTMLAttributes['data-align']) ||
			null;
		const width = normalizeImageWidth(HTMLAttributes.width ?? node?.attrs?.width);
		const height = normalizeImageWidth(HTMLAttributes.height ?? node?.attrs?.height);
		const { align: _align, ...rest } = HTMLAttributes;

		return [
			'img',
			mergeAttributes(this.options.HTMLAttributes, rest, {
				class: buildImageClassName(align),
				'data-align': align || undefined,
				width: width || undefined,
				height: height || undefined,
				style: buildImageStyle(width)
			})
		];
	}
});

module.exports = { BmImage };
