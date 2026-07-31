const MAX_SLUG_LENGTH = 80;

/**
 * Converts a title into a URL-safe slug. Unicode is normalised so accented
 * characters become their ASCII equivalents rather than being dropped.
 */
function generateSlug(value) {
	return String(value || '')
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, MAX_SLUG_LENGTH)
		.replace(/-+$/g, '');
}

function isValidSlug(value) {
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ''));
}

/**
 * Appends -2, -3, ... until `isTaken` reports the slug as free.
 * `isTaken` receives a candidate and returns a promise resolving to a boolean.
 */
async function buildUniqueSlug(candidate, isTaken, fallback = 'post') {
	const base = generateSlug(candidate) || generateSlug(fallback) || 'post';

	let slug = base;
	let suffix = 1;

	// eslint-disable-next-line no-await-in-loop -- each attempt depends on the previous result.
	while (await isTaken(slug)) {
		suffix += 1;
		slug = `${base}-${suffix}`;
	}

	return slug;
}

module.exports = { generateSlug, isValidSlug, buildUniqueSlug, MAX_SLUG_LENGTH };
