const { Image } = require('@tiptap/extension-image');
const { mergeAttributes } = require('@tiptap/core');
const {
	isImageAlignment,
	isImageLayout,
	isImageSpacing,
	normalizeImageWidth,
	normalizeImageAttrs,
	buildImageStyle,
	buildImageClassName,
	buildFigureClassName,
	shouldRenderFigure
} = require('./imageUtils');

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
		if (className.startsWith('bm-content-image-figure--align-')) {
			const align = className.replace('bm-content-image-figure--align-', '');
			if (isImageAlignment(align)) {
				return align;
			}
		}
	}

	const parentAlign = element.parentElement?.getAttribute('data-align');
	return isImageAlignment(parentAlign) ? parentAlign : null;
}

function parseLayout(element) {
	const direct = element.getAttribute('data-layout');
	if (isImageLayout(direct)) {
		return direct;
	}

	for (const className of element.classList) {
		if (className.startsWith('bm-content-image-figure--layout-')) {
			const layout = className.replace('bm-content-image-figure--layout-', '');
			if (isImageLayout(layout)) {
				return layout;
			}
		}
	}

	const parentLayout = element.parentElement?.getAttribute('data-layout');
	return isImageLayout(parentLayout) ? parentLayout : null;
}

function parseSpacing(element) {
	const direct = element.getAttribute('data-spacing');
	if (isImageSpacing(direct)) {
		return direct;
	}

	for (const className of element.classList) {
		if (className.startsWith('bm-content-image-figure--spacing-')) {
			const spacing = className.replace('bm-content-image-figure--spacing-', '');
			if (isImageSpacing(spacing)) {
				return spacing;
			}
		}
	}

	const parentSpacing = element.parentElement?.getAttribute('data-spacing');
	return isImageSpacing(parentSpacing) ? parentSpacing : null;
}

function parseCaption(element) {
	const figure = element.closest('figure.bm-content-image-figure');
	const caption = figure?.querySelector('figcaption.bm-content-image-caption');
	return caption?.textContent?.trim() || '';
}

function buildImageHtmlAttributes(attrs) {
	return {
		class: buildImageClassName(attrs.align),
		'data-align': attrs.align || undefined,
		src: attrs.src || undefined,
		alt: attrs.alt,
		width: attrs.width || undefined,
		height: attrs.height || undefined,
		style: buildImageStyle(attrs.width, attrs.layout)
	};
}

function buildFigureHtmlAttributes(attrs) {
	return {
		class: buildFigureClassName(attrs),
		'data-layout': attrs.layout,
		'data-align': attrs.align || undefined,
		'data-spacing': attrs.spacing
	};
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
				renderHTML: () => ({})
			},
			height: {
				default: null,
				parseHTML: (element) => parseNumericAttr(element.getAttribute('height')),
				renderHTML: () => ({})
			},
			align: {
				default: null,
				parseHTML: (element) => parseAlign(element),
				renderHTML: () => ({})
			},
			layout: {
				default: 'inline',
				parseHTML: (element) => parseLayout(element) || 'inline',
				renderHTML: () => ({})
			},
			caption: {
				default: '',
				parseHTML: (element) => parseCaption(element),
				renderHTML: () => ({})
			},
			spacing: {
				default: 'medium',
				parseHTML: (element) => parseSpacing(element) || 'medium',
				renderHTML: () => ({})
			},
			lockAspectRatio: {
				default: true,
				parseHTML: (element) => element.getAttribute('data-lock-aspect') !== 'false',
				renderHTML: () => ({})
			}
		};
	},

	parseHTML() {
		return [
			{
				tag: 'figure.bm-content-image-figure img[src]',
				getAttrs: () => null
			},
			{
				tag: 'img[src]',
				getAttrs: () => null
			}
		];
	},

	renderHTML({ node, HTMLAttributes }) {
		const normalized = normalizeImageAttrs({
			...node?.attrs,
			...HTMLAttributes
		});
		const imgAttrs = mergeAttributes(this.options.HTMLAttributes, buildImageHtmlAttributes(normalized));

		if (!shouldRenderFigure(normalized)) {
			return ['img', imgAttrs];
		}

		const figureChildren = [['img', imgAttrs]];
		if (normalized.caption) {
			figureChildren.push(['figcaption', { class: 'bm-content-image-caption' }, normalized.caption]);
		}

		return ['figure', buildFigureHtmlAttributes(normalized), ...figureChildren];
	}
});

module.exports = { BmImage };
