/**
 * Exercises the media library end to end against a live server, including a real
 * Cloudinary upload and cleanup.
 *
 *   node scripts/smoke-media.js [baseUrl]
 */
const crypto = require('crypto');
require('dotenv').config();

const BASE = process.argv[2] || 'http://localhost:5000';
const EMAIL = process.env.ADMIN_EMAIL || process.env.ADMIN_ID;
const PASSWORD = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS;

let passed = 0;
let failed = 0;

function check(label, condition, detail = '') {
	if (condition) {
		passed += 1;
		console.log(`  PASS  ${label}`);
	} else {
		failed += 1;
		console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
	}
}

async function call(path, options = {}) {
	const response = await fetch(`${BASE}${path}`, options);
	const body = await response.json().catch(() => ({}));
	return { status: response.status, body };
}

/** A minimal valid 4x4 PNG, built rather than read from disk. */
function makePng() {
	const chunk = (type, data) => {
		const length = Buffer.alloc(4);
		length.writeUInt32BE(data.length);
		const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
		const crc = Buffer.alloc(4);
		crc.writeUInt32BE(crc32(typeAndData) >>> 0);
		return Buffer.concat([length, typeAndData, crc]);
	};

	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(4, 0);
	ihdr.writeUInt32BE(4, 4);
	ihdr[8] = 8;
	ihdr[9] = 2;

	const zlib = require('zlib');
	const raw = Buffer.concat(Array.from({ length: 4 }, () => Buffer.concat([
		Buffer.from([0]),
		Buffer.from([255, 200, 21, 255, 200, 21, 255, 200, 21, 255, 200, 21])
	])));

	return Buffer.concat([
		Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
		chunk('IHDR', ihdr),
		chunk('IDAT', zlib.deflateSync(raw)),
		chunk('IEND', Buffer.alloc(0))
	]);
}

let crcTable = null;
function crc32(buffer) {
	if (!crcTable) {
		crcTable = [];
		for (let n = 0; n < 256; n += 1) {
			let c = n;
			for (let k = 0; k < 8; k += 1) {
				c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
			}
			crcTable[n] = c;
		}
	}

	let crc = 0 ^ (-1);
	for (let i = 0; i < buffer.length; i += 1) {
		crc = (crc >>> 8) ^ crcTable[(crc ^ buffer[i]) & 0xff];
	}
	return (crc ^ (-1)) >>> 0;
}

async function main() {
	console.log(`Media smoke testing ${BASE}\n`);

	const login = await call('/api/admin/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email: EMAIL, password: PASSWORD })
	});
	if (!login.body.token) {
		console.error('Could not log in; aborting.');
		process.exit(1);
	}
	const token = login.body.token;
	const authHeaders = { Authorization: `Bearer ${token}` };

	console.log('Access control');
	const unauth = await call('/api/admin/media');
	check('GET /api/admin/media requires auth', unauth.status === 401, `status ${unauth.status}`);

	const unauthUpload = await fetch(`${BASE}/api/admin/media`, { method: 'POST', body: new FormData() });
	check('POST /api/admin/media requires auth', unauthUpload.status === 401, `status ${unauthUpload.status}`);

	console.log('\nValidation');
	const noFile = await fetch(`${BASE}/api/admin/media`, { method: 'POST', headers: authHeaders, body: new FormData() });
	check('uploading with no file returns 400', noFile.status === 400, `status ${noFile.status}`);

	const badTypeForm = new FormData();
	badTypeForm.append('file', new Blob(['#!/bin/sh\necho hi'], { type: 'application/x-sh' }), 'evil.sh');
	const badType = await fetch(`${BASE}/api/admin/media`, { method: 'POST', headers: authHeaders, body: badTypeForm });
	check('a disallowed file type is rejected with 415', badType.status === 415, `status ${badType.status}`);

	console.log('\nUpload');
	const png = makePng();
	const form = new FormData();
	form.append('file', new Blob([png], { type: 'image/png' }), `smoke-${Date.now()}.png`);

	const uploadResponse = await fetch(`${BASE}/api/admin/media`, { method: 'POST', headers: authHeaders, body: form });
	const uploaded = await uploadResponse.json().catch(() => ({}));
	check('a PNG uploads successfully', uploadResponse.status === 201 && Boolean(uploaded.asset?._id), `status ${uploadResponse.status} ${JSON.stringify(uploaded).slice(0, 200)}`);

	const asset = uploaded.asset || {};
	check('the asset is stored under the bm-blog folder', String(asset.publicId).startsWith('bm-blog/images/'), `publicId ${asset.publicId}`);
	check('the asset is classified as an image', asset.kind === 'image' && asset.resourceType === 'image', `kind ${asset.kind}`);
	check('dimensions were captured', asset.width === 4 && asset.height === 4, `${asset.width}x${asset.height}`);
	check('file size was captured', asset.bytes > 0, `bytes ${asset.bytes}`);
	check('the delivery URL is on the Cloudinary CDN', String(asset.url).includes('res.cloudinary.com'), `url ${asset.url}`);

	console.log('\nDelivery URL optimisation');
	const { buildDeliveryUrl, buildSrcSet } = require('../src/utils/cloudinaryUrl');
	const optimised = buildDeliveryUrl(asset.publicId, { width: 800 });
	check('a built URL requests automatic format and quality', optimised.includes('f_auto') && optimised.includes('q_auto'), optimised);
	check('a built URL carries the requested width', optimised.includes('w_800'), optimised);

	const fetched = await fetch(optimised);
	check('the optimised URL actually serves an image', fetched.ok, `status ${fetched.status}`);
	check(
		'Cloudinary negotiates a modern format',
		['image/webp', 'image/avif', 'image/png'].includes(fetched.headers.get('content-type')),
		`content-type ${fetched.headers.get('content-type')}`
	);

	const srcset = buildSrcSet(asset.publicId);
	check('a srcset with multiple widths is produced', srcset.split(',').length >= 5 && srcset.includes('320w'));

	console.log('\nLibrary');
	const listed = await call('/api/admin/media', { headers: authHeaders });
	check('the new asset appears in the library', listed.body.assets?.some((a) => a._id === asset._id), `status ${listed.status}`);
	check('the list is paginated', Boolean(listed.body.pagination?.totalPages), JSON.stringify(listed.body.pagination));

	const filtered = await call('/api/admin/media?kind=image', { headers: authHeaders });
	check('filtering by kind works', filtered.body.assets?.every((a) => a.kind === 'image'));

	const searched = await call(`/api/admin/media?search=${encodeURIComponent(asset.displayName)}`, { headers: authHeaders });
	check('searching by name finds the asset', searched.body.assets?.some((a) => a._id === asset._id));

	const missing = await call('/api/admin/media?kind=video&search=zzz-no-such-asset', { headers: authHeaders });
	check('a search with no matches returns an empty list', missing.body.assets?.length === 0);

	console.log('\nMetadata');
	const patched = await call(`/api/admin/media/${asset._id}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json', ...authHeaders },
		body: JSON.stringify({ alt: 'A yellow test square', caption: 'Smoke test', tags: ['Smoke', 'TEST'] })
	});
	check('alt text and caption can be edited', patched.body.asset?.alt === 'A yellow test square', `alt ${patched.body.asset?.alt}`);
	check('tags are normalised to lowercase', JSON.stringify(patched.body.asset?.tags) === JSON.stringify(['smoke', 'test']), JSON.stringify(patched.body.asset?.tags));

	console.log('\nDeletion');
	const removed = await call(`/api/admin/media/${asset._id}`, { method: 'DELETE', headers: authHeaders });
	check('the asset can be deleted', removed.status === 200 && Boolean(removed.body.asset?.deletedAt), `status ${removed.status}`);

	const afterDelete = await call('/api/admin/media', { headers: authHeaders });
	check('a deleted asset is hidden from the library', !afterDelete.body.assets?.some((a) => a._id === asset._id));

	const goneFromCdn = await fetch(asset.url, { cache: 'no-store' });
	check('the file is gone from Cloudinary', goneFromCdn.status === 404, `status ${goneFromCdn.status}`);

	console.log(`\n${passed} passed, ${failed} failed`);
	process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
	console.error('Media smoke run crashed:', err);
	process.exit(1);
});
