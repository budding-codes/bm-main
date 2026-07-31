/**
 * Ad-hoc smoke test for the public and admin API surface.
 * Run against a live server: node scripts/smoke.js [baseUrl]
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

function forgeToken(secret) {
	const payload = Buffer.from(JSON.stringify({
		email: EMAIL,
		exp: Date.now() + 60000
	})).toString('base64url');
	const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
	return `${payload}.${signature}`;
}

async function main() {
	console.log(`Smoke testing ${BASE}\n`);

	console.log('Auth');
	const login = await call('/api/admin/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email: EMAIL, password: PASSWORD })
	});
	check('POST /api/admin/login returns a token', login.status === 200 && Boolean(login.body.token), `status ${login.status}`);
	const token = login.body.token;
	const authHeaders = { Authorization: `Bearer ${token}` };

	const badLogin = await call('/api/admin/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email: EMAIL, password: 'wrong-password' })
	});
	check('POST /api/admin/login rejects a bad password', badLogin.status === 401, `status ${badLogin.status}`);

	const session = await call('/api/admin/session', { headers: authHeaders });
	check('GET /api/admin/session accepts the token', session.status === 200, `status ${session.status}`);

	const noAuthSession = await call('/api/admin/session');
	check('GET /api/admin/session rejects a missing token', noAuthSession.status === 401, `status ${noAuthSession.status}`);

	const legacy = await call('/api/admin/session', {
		headers: { Authorization: `Bearer ${forgeToken('bm-promo-admin-secret')}` }
	});
	check('a token forged with the old hardcoded secret is rejected', legacy.status === 401, `status ${legacy.status}`);

	console.log('\nLeads');
	const leadsPublic = await call('/api/store-user-info');
	check('GET /api/store-user-info requires auth', leadsPublic.status === 401, `status ${leadsPublic.status}`);

	const leadsAuthed = await call('/api/store-user-info', { headers: authHeaders });
	check('GET /api/store-user-info works with auth', leadsAuthed.status === 200 && Array.isArray(leadsAuthed.body.users), `status ${leadsAuthed.status}`);

	const adminLeads = await call('/api/admin/leads', { headers: authHeaders });
	check('GET /api/admin/leads works', adminLeads.status === 200 && Array.isArray(adminLeads.body.leads), `status ${adminLeads.status}`);

	console.log('\nBlogs');
	const publicBlogs = await call('/api/blogs');
	check('GET /api/blogs is public', publicBlogs.status === 200 && Array.isArray(publicBlogs.body.blogs), `status ${publicBlogs.status}`);

	const adminBlogs = await call('/api/admin/blogs', { headers: authHeaders });
	check('GET /api/admin/blogs requires and accepts auth', adminBlogs.status === 200 && Array.isArray(adminBlogs.body.blogs), `status ${adminBlogs.status}`);

	const adminBlogsNoAuth = await call('/api/admin/blogs');
	check('GET /api/admin/blogs rejects a missing token', adminBlogsNoAuth.status === 401, `status ${adminBlogsNoAuth.status}`);

	console.log('\nBlog CRUD lifecycle');
	const jsonAuth = { 'Content-Type': 'application/json', ...authHeaders };
	const marker = `smoke-test-${Date.now()}`;

	const missingFields = await call('/api/admin/blogs', {
		method: 'POST',
		headers: jsonAuth,
		body: JSON.stringify({ title: marker })
	});
	check(
		'POST /api/admin/blogs rejects a missing description with the original message',
		missingFields.status === 400 && missingFields.body.error === 'Title and description are required.',
		`status ${missingFields.status}, error ${JSON.stringify(missingFields.body.error)}`
	);

	const created = await call('/api/admin/blogs', {
		method: 'POST',
		headers: jsonAuth,
		body: JSON.stringify({
			title: marker,
			description: 'Created by the smoke suite.',
			youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ',
			published: false
		})
	});
	check('POST /api/admin/blogs creates a blog', created.status === 201 && Boolean(created.body.blog?._id), `status ${created.status}`);
	const blogId = created.body.blog?._id;

	check(
		'author defaults to "BM Team" when omitted',
		created.body.blog?.author === 'BM Team',
		`author ${JSON.stringify(created.body.blog?.author)}`
	);
	check(
		'thumbnailUrl is derived from the YouTube URL',
		created.body.blog?.thumbnailUrl === 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
		`thumbnailUrl ${JSON.stringify(created.body.blog?.thumbnailUrl)}`
	);

	const draftHidden = await call('/api/blogs');
	check(
		'an unpublished blog is absent from the public list',
		!draftHidden.body.blogs?.some((blog) => blog._id === blogId)
	);

	const draftVisible = await call('/api/admin/blogs', { headers: authHeaders });
	check(
		'an unpublished blog is present in the admin list',
		draftVisible.body.blogs?.some((blog) => blog._id === blogId)
	);

	const updated = await call(`/api/admin/blogs/${blogId}`, {
		method: 'PUT',
		headers: jsonAuth,
		body: JSON.stringify({
			title: `${marker} updated`,
			description: 'Updated by the smoke suite.',
			author: 'Smoke Runner',
			published: true
		})
	});
	check(
		'PUT /api/admin/blogs/:id updates a blog',
		updated.status === 200 && updated.body.blog?.title === `${marker} updated` && updated.body.blog?.author === 'Smoke Runner',
		`status ${updated.status}`
	);

	const missingUpdate = await call('/api/admin/blogs/000000000000000000000000', {
		method: 'PUT',
		headers: jsonAuth,
		body: JSON.stringify({ title: 'x', description: 'y' })
	});
	check(
		'PUT on an unknown id returns the original 404 message',
		missingUpdate.status === 404 && missingUpdate.body.error === 'Blog not found.',
		`status ${missingUpdate.status}, error ${JSON.stringify(missingUpdate.body.error)}`
	);

	const removed = await call(`/api/admin/blogs/${blogId}`, { method: 'DELETE', headers: authHeaders });
	check(
		'DELETE /api/admin/blogs/:id removes the blog',
		removed.status === 200 && removed.body.message === 'Blog deleted.',
		`status ${removed.status}`
	);

	const removedAgain = await call(`/api/admin/blogs/${blogId}`, { method: 'DELETE', headers: authHeaders });
	check('DELETE on an already-removed blog returns 404', removedAgain.status === 404, `status ${removedAgain.status}`);

	console.log('\nBody size');
	const big = await call('/api/admin/blogs', {
		method: 'POST',
		headers: jsonAuth,
		body: JSON.stringify({ title: '', description: 'x'.repeat(400 * 1024) })
	});
	check('a 400kb body is parsed rather than rejected as too large', big.status !== 413, `status ${big.status}`);

	console.log('\nMisc');
	const root = await fetch(`${BASE}/`);
	check('GET / responds', root.status === 200, `status ${root.status}`);

	const unknown = await call('/api/does-not-exist');
	check('an unknown API path returns a JSON 404', unknown.status === 404 && Boolean(unknown.body.error), `status ${unknown.status}`);

	console.log(`\n${passed} passed, ${failed} failed`);
	process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
	console.error('Smoke run crashed:', err.message);
	process.exit(1);
});
