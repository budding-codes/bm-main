/**
 * Validation tests for blog image configuration normalization.
 *
 *   npm run check:image
 */
const {
	normalizeImageAttrs,
	isImageAlignment,
	isImageLayout,
	isImageSpacing,
	normalizeImageWidth,
	resolveLayoutDimensions
} = require('../src/content/imageUtils');

let failed = 0;

function check(label, condition, detail = '') {
	if (condition) {
		console.log(`  PASS  ${label}`);
		return;
	}

	failed += 1;
	console.log(`  FAIL  ${label}${detail ? `\n        ${detail}` : ''}`);
}

check('defaults to inline layout', normalizeImageAttrs({}).layout === 'inline');
check('defaults to medium spacing', normalizeImageAttrs({}).spacing === 'medium');
check('defaults lock aspect ratio to true', normalizeImageAttrs({}).lockAspectRatio === true);

check(
	'full-width clears explicit dimensions',
	normalizeImageAttrs({ layout: 'full-width', width: 600, height: 400 }).width === null &&
		normalizeImageAttrs({ layout: 'full-width', width: 600, height: 400 }).height === null
);

check(
	'wrap-left defaults align to left',
	normalizeImageAttrs({ layout: 'wrap-left' }).align === 'left'
);

check(
	'wrap-right defaults align to right',
	normalizeImageAttrs({ layout: 'wrap-right' }).align === 'right'
);

check('rejects invalid alignment', !isImageAlignment('top'));
check('accepts valid alignment', isImageAlignment('center'));
check('rejects invalid layout', !isImageLayout('float-left'));
check('accepts valid layout', isImageLayout('wrap-left'));
check('rejects invalid spacing', !isImageSpacing('huge'));
check('accepts valid spacing', isImageSpacing('large'));

check('clamps width to max', normalizeImageWidth(5000) === 1200);
check('rejects zero width', normalizeImageWidth(0) === null);
check('rejects negative width', normalizeImageWidth(-10) === null);
check('rejects NaN width', normalizeImageWidth(Number.NaN) === null);

check(
	'caption is trimmed',
	normalizeImageAttrs({ caption: '  Training day  ' }).caption === 'Training day'
);

check(
	'malicious caption text is stored as plain string',
	normalizeImageAttrs({ caption: '<script>alert(1)</script>' }).caption === '<script>alert(1)</script>'
);

check(
	'wrap layout without width gets a default width',
	resolveLayoutDimensions({ layout: 'wrap-right', width: null, height: null, lockAspectRatio: true }).width === 480
);

check(
	'wrap layout uses natural width when available',
	resolveLayoutDimensions(
		{ layout: 'wrap-left', width: null, height: null, lockAspectRatio: true },
		960,
		540
	).width === 720
);

check(
	'full-width layout clears dimensions',
	resolveLayoutDimensions(
		{ layout: 'full-width', width: 400, height: 300, lockAspectRatio: true },
		960,
		540
	).width === null
);

console.log(failed === 0 ? '\nImage configuration checks passed.' : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
