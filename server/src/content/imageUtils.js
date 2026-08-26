const IMAGE_MIN_WIDTH = 80;
const IMAGE_MAX_WIDTH = 1200;
const IMAGE_ALIGNMENTS = new Set(['left', 'center', 'right']);
const IMAGE_LAYOUTS = new Set(['inline', 'wrap-left', 'wrap-right', 'full-width']);
const IMAGE_SPACINGS = new Set(['small', 'medium', 'large']);

function isImageAlignment(value) {
	return typeof value === 'string' && IMAGE_ALIGNMENTS.has(value);
}

function isImageLayout(value) {
	return typeof value === 'string' && IMAGE_LAYOUTS.has(value);
}

function isImageSpacing(value) {
	return typeof value === 'string' && IMAGE_SPACINGS.has(value);
}

function normalizeImageWidth(value) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return null;
	}
	return Math.round(Math.min(IMAGE_MAX_WIDTH, Math.max(IMAGE_MIN_WIDTH, parsed)));
}

function normalizeImageHeight(value, width, aspectRatio) {
	const parsed = Number(value);
	if (Number.isFinite(parsed) && parsed > 0) {
		return Math.round(Math.min(IMAGE_MAX_WIDTH * 3, Math.max(IMAGE_MIN_WIDTH, parsed)));
	}
	if (width > 0 && aspectRatio > 0) {
		return Math.round(width / aspectRatio);
	}
	return null;
}

function normalizeImageAttrs(attrs = {}) {
	const layout = isImageLayout(attrs.layout) ? attrs.layout : 'inline';
	let align = isImageAlignment(attrs.align) ? attrs.align : null;
	let width = normalizeImageWidth(attrs.width);
	let height = normalizeImageWidth(attrs.height);
	const spacing = isImageSpacing(attrs.spacing) ? attrs.spacing : 'medium';
	const lockAspectRatio = attrs.lockAspectRatio !== false;
	const caption = typeof attrs.caption === 'string' ? attrs.caption.trim() : '';
	const src = typeof attrs.src === 'string' ? attrs.src : '';
	const alt = typeof attrs.alt === 'string' ? attrs.alt : '';

	if (layout === 'full-width') {
		width = null;
		height = null;
		align = 'center';
	} else if (layout === 'wrap-left') {
		align = align || 'left';
	} else if (layout === 'wrap-right') {
		align = align || 'right';
	}

	if (width && !height && lockAspectRatio) {
		height = normalizeImageHeight(null, width, 1);
	}

	return {
		src,
		alt,
		width,
		height,
		align,
		layout,
		caption,
		spacing,
		lockAspectRatio
	};
}

function buildImageStyle(width, layout = 'inline') {
	if (layout === 'full-width') {
		return 'width: 100%; max-width: 100%; height: auto;';
	}
	if (!width) {
		return undefined;
	}
	return `width: ${width}px; max-width: 100%; height: auto;`;
}

function buildImageClassName(align, extra) {
	const classes = ['bm-content-image'];
	if (extra) {
		classes.push(extra);
	}
	if (align) {
		classes.push(`bm-content-image--align-${align}`);
	}
	return classes.join(' ');
}

function buildFigureClassName(attrs) {
	const classes = ['bm-content-image-figure'];
	if (attrs.layout) {
		classes.push(`bm-content-image-figure--layout-${attrs.layout}`);
	}
	if (attrs.align) {
		classes.push(`bm-content-image-figure--align-${attrs.align}`);
	}
	if (attrs.spacing) {
		classes.push(`bm-content-image-figure--spacing-${attrs.spacing}`);
	}
	return classes.join(' ');
}

function shouldRenderFigure(attrs) {
	return Boolean(attrs.caption) || attrs.layout !== 'inline' || Boolean(attrs.align) || attrs.spacing !== 'medium';
}

const IMAGE_SIZE_PRESET_WIDTHS = {
	small: 240,
	medium: 480,
	large: 720
};

function resolveLayoutDimensions(attrs, naturalWidth, naturalHeight) {
	if (attrs.layout === 'full-width') {
		return { width: null, height: null };
	}

	if (attrs.width) {
		const ratio =
			naturalWidth && naturalHeight && naturalHeight > 0
				? naturalWidth / naturalHeight
				: attrs.height && attrs.height > 0
					? attrs.width / attrs.height
					: 1;

		return {
			width: attrs.width,
			height:
				attrs.height ??
				(attrs.lockAspectRatio !== false ? normalizeImageHeight(null, attrs.width, ratio) : null)
		};
	}

	const width =
		naturalWidth && naturalWidth > 0
			? normalizeImageWidth(Math.min(naturalWidth, IMAGE_SIZE_PRESET_WIDTHS.large))
			: IMAGE_SIZE_PRESET_WIDTHS.medium;

	if (!width) {
		return { width: null, height: null };
	}

	const ratio =
		naturalWidth && naturalHeight && naturalHeight > 0 ? naturalWidth / naturalHeight : 1;
	const height =
		attrs.lockAspectRatio !== false
			? normalizeImageHeight(null, width, ratio)
			: attrs.height ?? normalizeImageHeight(null, width, ratio);

	return { width, height };
}

module.exports = {
	IMAGE_MIN_WIDTH,
	IMAGE_MAX_WIDTH,
	isImageAlignment,
	isImageLayout,
	isImageSpacing,
	normalizeImageWidth,
	normalizeImageHeight,
	normalizeImageAttrs,
	buildImageStyle,
	buildImageClassName,
	buildFigureClassName,
	shouldRenderFigure,
	resolveLayoutDimensions
};
