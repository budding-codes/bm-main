const env = require('../config/env');

const DEFAULT_DELIVERY_HOST = 'https://res.cloudinary.com';

/**
 * Widths generated for responsive `srcset` entries. Chosen to cover common
 * container sizes without producing an excessive number of renditions.
 */
const RESPONSIVE_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1600, 1920];

function buildTransform({ width, height, crop, quality, format, dpr, blur }) {
	const parts = [];

	// f_auto lets Cloudinary serve AVIF or WebP based on the request's Accept
	// header; q_auto picks a compression level from the image's own content.
	parts.push(`f_${format || 'auto'}`);
	parts.push(`q_${quality || 'auto'}`);

	if (width) parts.push(`w_${Math.round(width)}`);
	if (height) parts.push(`h_${Math.round(height)}`);
	if (width || height) parts.push(`c_${crop || 'limit'}`);
	if (dpr) parts.push(`dpr_${dpr}`);
	if (blur) parts.push(`e_blur:${blur}`);

	return parts.join(',');
}

/**
 * Builds a delivery URL for a stored public ID. Transformations live in the URL
 * rather than in the stored file, so the same original can serve every size.
 */
function buildDeliveryUrl(publicId, options = {}) {
	if (!publicId || !env.cloudinary.cloudName) {
		return '';
	}

	const resourceType = options.resourceType || 'image';
	const transform = buildTransform(options);

	return [
		DEFAULT_DELIVERY_HOST,
		env.cloudinary.cloudName,
		resourceType,
		'upload',
		transform,
		publicId
	].join('/');
}

function buildSrcSet(publicId, options = {}) {
	if (!publicId || !env.cloudinary.cloudName) {
		return '';
	}

	const maxWidth = options.maxWidth || 0;
	const widths = maxWidth
		? RESPONSIVE_WIDTHS.filter((width) => width <= maxWidth * 2)
		: RESPONSIVE_WIDTHS;

	return (widths.length > 0 ? widths : RESPONSIVE_WIDTHS)
		.map((width) => `${buildDeliveryUrl(publicId, { ...options, width })} ${width}w`)
		.join(', ');
}

/** A tiny, heavily blurred rendition usable as a loading placeholder. */
function buildPlaceholderUrl(publicId) {
	return buildDeliveryUrl(publicId, { width: 24, quality: 30, blur: 400 });
}

module.exports = {
	buildDeliveryUrl,
	buildSrcSet,
	buildPlaceholderUrl,
	RESPONSIVE_WIDTHS
};
