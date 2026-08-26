/**
 * Exercises the rich content pipeline: JSON/HTML synchronisation, slugs,
 * scheduling, revisions, drafts, and the public slug route.
 *
 *   node scripts/smoke-content.js [baseUrl]
 */
require('dotenv').config();

const BASE = process.argv[2] || 'http://localhost:5000';
const EMAIL = process.env.ADMIN_EMAIL || process.env.ADMIN_ID;
const PASSWORD = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS;

let passed = 0;
let failed = 0;
const createdIds = [];

function check(label, condition, detail = '') {
	if (condition) {
		passed += 1;
		console.log(`  PASS  ${label}`);
	} else {
		failed += 1;
		console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
	}
}

let authHeaders = {};
let jsonAuth = {};

async function call(path, options = {}) {
	const response = await fetch(`${BASE}${path}`, options);
	const body = await response.json().catch(() => ({}));
	return { status: response.status, body };
}

const post = (path, payload) => call(path, { method: 'POST', headers: jsonAuth, body: JSON.stringify(payload) });
const put = (path, payload) => call(path, { method: 'PUT', headers: jsonAuth, body: JSON.stringify(payload) });
const patch = (path, payload) => call(path, { method: 'PATCH', headers: jsonAuth, body: JSON.stringify(payload) });

function doc(text, extra = []) {
	return {
		type: 'doc',
		content: [
			{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Heading' }] },
			{ type: 'paragraph', content: [{ type: 'text', text }] },
			...extra
		]
	};
}

async function createBlog(payload) {
	const result = await post('/api/admin/blogs', payload);
	if (result.body.blog?._id) {
		createdIds.push(result.body.blog._id);
	}
	return result;
}

async function main() {
	console.log(`Content smoke testing ${BASE}\n`);

	const login = await call('/api/admin/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email: EMAIL, password: PASSWORD })
	});
	if (!login.body.token) {
		console.error('Could not log in; aborting.');
		process.exit(1);
	}
	authHeaders = { Authorization: `Bearer ${login.body.token}` };
	jsonAuth = { 'Content-Type': 'application/json', ...authHeaders };

	const stamp = Date.now();

	console.log('Content rendering');
	const created = await createBlog({
		title: `Life at Sea ${stamp}`,
		contentBlocks: doc('Merchant navy officers train for years before their first command.'),
		status: 'published'
	});
	check('a post can be created from Tiptap JSON alone', created.status === 201, `status ${created.status} ${JSON.stringify(created.body).slice(0, 200)}`);
	const blog = created.body.blog || {};
	const blogId = blog._id;

	check('HTML is generated on the server', blog.contentHtml?.includes('<h2>Heading</h2>'), `html ${String(blog.contentHtml).slice(0, 120)}`);
	check('plain text is derived', blog.contentText?.includes('Merchant navy officers'), `text ${blog.contentText}`);
	check('the word count is computed', blog.wordCount > 5, `wordCount ${blog.wordCount}`);
	check('reading time is computed', blog.readingTimeMinutes >= 1, `readingTime ${blog.readingTimeMinutes}`);
	check('the excerpt is derived from the content', blog.description?.includes('Heading'), `description ${blog.description}`);
	check('a slug is generated from the title', blog.slug === `life-at-sea-${stamp}`, `slug ${blog.slug}`);
	check('published state mirrors the status', blog.status === 'published' && blog.published === true, `${blog.status}/${blog.published}`);
	check('publishedAt is stamped', Boolean(blog.publishedAt));

	console.log('\nHTML cannot be injected by the client');
	const injected = await createBlog({
		title: `Injection ${stamp}`,
		contentHtml: '<script>alert(1)</script><p>evil</p>',
		contentBlocks: doc('Legitimate body text goes here.'),
		status: 'draft'
	});
	check(
		'a client-supplied contentHtml is ignored',
		!injected.body.blog?.contentHtml?.includes('<script'),
		`html ${String(injected.body.blog?.contentHtml).slice(0, 120)}`
	);
	check(
		'the stored HTML is the one rendered from JSON',
		injected.body.blog?.contentHtml?.includes('Legitimate body text'),
		`html ${String(injected.body.blog?.contentHtml).slice(0, 120)}`
	);

	const unknownNode = await createBlog({
		title: `Unknown ${stamp}`,
		contentBlocks: { type: 'doc', content: [{ type: 'somethingElse' }] },
		status: 'draft'
	});
	check('an unrenderable node is rejected with 400', unknownNode.status === 400, `status ${unknownNode.status}`);
	check('the error names the offending node', String(unknownNode.body.error).includes('somethingElse'), unknownNode.body.error);

	console.log('\nPartial updates preserve content');
	const toggled = await patch(`/api/admin/blogs/${blogId}`, { published: false });
	check('a publish toggle succeeds', toggled.status === 200, `status ${toggled.status}`);
	check('the toggle did not erase the content', Boolean(toggled.body.blog?.contentHtml), `html ${String(toggled.body.blog?.contentHtml).slice(0, 80)}`);
	check('the toggle moved the status to draft', toggled.body.blog?.status === 'draft' && toggled.body.blog?.published === false);

	const retitled = await patch(`/api/admin/blogs/${blogId}`, { title: `Renamed ${stamp}` });
	check('a title-only update keeps the content', retitled.body.blog?.contentHtml?.includes('Merchant navy officers'));
	check('a title-only update keeps the original slug', retitled.body.blog?.slug === `life-at-sea-${stamp}`, `slug ${retitled.body.blog?.slug}`);

	console.log('\nSlugs');
	const duplicate = await createBlog({
		title: `Life at Sea ${stamp}`,
		contentBlocks: doc('A different post that happens to share a title.'),
		status: 'draft'
	});
	check('a duplicate title gets a suffixed slug', duplicate.body.blog?.slug === `life-at-sea-${stamp}-2`, `slug ${duplicate.body.blog?.slug}`);

	const explicitSlug = await put(`/api/admin/blogs/${duplicate.body.blog._id}`, {
		title: `Life at Sea ${stamp}`,
		description: 'Manual slug test.',
		slug: `custom-slug-${stamp}`
	});
	check('an explicit slug is accepted', explicitSlug.body.blog?.slug === `custom-slug-${stamp}`, `slug ${explicitSlug.body.blog?.slug}`);

	const takenSlug = await patch(`/api/admin/blogs/${blogId}`, { slug: `custom-slug-${stamp}` });
	check('a slug already in use is rejected', takenSlug.status === 400, `status ${takenSlug.status}`);

	const messySlug = await patch(`/api/admin/blogs/${blogId}`, { slug: '  Héllo World!! ' });
	check('a messy slug is normalised rather than rejected', messySlug.body.blog?.slug === 'hello-world', `slug ${messySlug.body.blog?.slug}`);

	console.log('\nPublic slug route');
	await patch(`/api/admin/blogs/${blogId}`, { status: 'published' });
	const publicBySlug = await call('/api/blogs/hello-world');
	check('GET /api/blogs/:slug returns the post', publicBySlug.status === 200 && publicBySlug.body.blog?._id === blogId, `status ${publicBySlug.status}`);
	check('the public payload carries the rendered HTML', Boolean(publicBySlug.body.blog?.contentHtml));

	await patch(`/api/admin/blogs/${blogId}`, { status: 'draft' });
	const draftBySlug = await call('/api/blogs/hello-world');
	check('a draft is not reachable by slug', draftBySlug.status === 404, `status ${draftBySlug.status}`);

	const unknownSlug = await call('/api/blogs/no-such-post-anywhere');
	check('an unknown slug returns 404', unknownSlug.status === 404, `status ${unknownSlug.status}`);

	console.log('\nScheduling');
	const past = new Date(Date.now() - 60000).toISOString();
	const future = new Date(Date.now() + 86400000).toISOString();

	const scheduledDue = await createBlog({
		title: `Due ${stamp}`,
		contentBlocks: doc('This one was scheduled for a moment ago.'),
		status: 'scheduled',
		scheduledFor: past
	});
	check('a scheduled post can be created', scheduledDue.status === 201, `status ${scheduledDue.status} ${scheduledDue.body.error || ''}`);

	const scheduledFuture = await createBlog({
		title: `Pending ${stamp}`,
		contentBlocks: doc('This one is scheduled for tomorrow.'),
		status: 'scheduled',
		scheduledFor: future
	});

	const publicList = await call('/api/blogs');
	const publicIds = (publicList.body.blogs || []).map((b) => b._id);
	check('a scheduled post whose time has passed is public', publicIds.includes(scheduledDue.body.blog._id));
	check('a future-scheduled post is not public', !publicIds.includes(scheduledFuture.body.blog._id));

	const noDate = await createBlog({
		title: `No date ${stamp}`,
		contentBlocks: doc('Scheduled without a date.'),
		status: 'scheduled'
	});
	check('scheduling without a date is rejected', noDate.status === 400, `status ${noDate.status}`);

	const expired = await createBlog({
		title: `Expired ${stamp}`,
		contentBlocks: doc('This notice has already expired.'),
		status: 'published',
		expiresAt: past
	});
	const listAfterExpiry = await call('/api/blogs');
	check('an expired post is hidden from the public list', !(listAfterExpiry.body.blogs || []).map((b) => b._id).includes(expired.body.blog._id));

	console.log('\nRevisions');
	const revisionTarget = scheduledDue.body.blog._id;
	await put(`/api/admin/blogs/${revisionTarget}`, {
		title: `Due ${stamp} v2`,
		contentBlocks: doc('Second version of the body text.')
	});
	await put(`/api/admin/blogs/${revisionTarget}`, {
		title: `Due ${stamp} v3`,
		contentBlocks: doc('Third version of the body text.')
	});

	const revisions = await call(`/api/admin/blogs/${revisionTarget}/revisions`, { headers: authHeaders });
	check('revisions accumulate', (revisions.body.revisions || []).length >= 3, `count ${(revisions.body.revisions || []).length}`);
	check('the revision list omits heavy content fields', revisions.body.revisions?.[0]?.contentHtml === undefined);

	const firstRevision = await call(`/api/admin/blogs/${revisionTarget}/revisions/1`, { headers: authHeaders });
	check('a single revision can be fetched with its content', Boolean(firstRevision.body.revision?.contentBlocks), `status ${firstRevision.status}`);

	const restored = await post(`/api/admin/blogs/${revisionTarget}/revisions/1/restore`, {});
	check('a revision can be restored', restored.status === 200, `status ${restored.status}`);
	check('restoring brings back the old content', restored.body.blog?.contentText?.includes('scheduled for a moment ago'), `text ${restored.body.blog?.contentText}`);

	const afterRestore = await call(`/api/admin/blogs/${revisionTarget}/revisions`, { headers: authHeaders });
	check('restoring adds history rather than removing it', (afterRestore.body.revisions || []).length > (revisions.body.revisions || []).length);

	console.log('\nServer-side draft recovery');
	const draftSave = await put(`/api/admin/blogs/${blogId}/draft`, {
		title: 'Work in progress',
		contentBlocks: doc('An unsaved thought that should not go live.')
	});
	check('a draft can be autosaved', draftSave.status === 200 && Boolean(draftSave.body.draft?.savedAt), `status ${draftSave.status}`);

	const afterDraft = await call(`/api/admin/blogs/${blogId}`, { headers: authHeaders });
	check('the draft is stored separately', afterDraft.body.blog?.draft?.title === 'Work in progress');
	check('the live content is untouched by autosave', afterDraft.body.blog?.contentText?.includes('Merchant navy officers'), `text ${afterDraft.body.blog?.contentText}`);

	const fontDraft = await put(`/api/admin/blogs/${blogId}/draft`, {
		title: 'Font draft',
		contentBlocks: {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							marks: [{ type: 'fontFamily', attrs: { fontId: 'inter' } }],
							text: 'Inter body copy'
						}
					]
				}
			]
		}
	});
	check('a draft with fontFamily marks autosaves', fontDraft.status === 200, `status ${fontDraft.status}`);

	const afterFontDraft = await call(`/api/admin/blogs/${blogId}`, { headers: authHeaders });
	check(
		'font draft is stored in draft.contentBlocks',
		afterFontDraft.body.blog?.draft?.contentBlocks?.content?.[0]?.content?.[0]?.marks?.[0]?.type === 'fontFamily',
		`draft ${JSON.stringify(afterFontDraft.body.blog?.draft?.contentBlocks)}`
	);

	const discarded = await call(`/api/admin/blogs/${blogId}/draft`, { method: 'DELETE', headers: authHeaders });
	check('a draft can be discarded', discarded.status === 200 && !discarded.body.draft?.savedAt);

	console.log('\nAccess control');
	for (const [label, path, options] of [
		['GET /api/admin/blogs/:id', `/api/admin/blogs/${blogId}`, {}],
		['GET revisions', `/api/admin/blogs/${blogId}/revisions`, {}],
		['PUT draft', `/api/admin/blogs/${blogId}/draft`, { method: 'PUT' }],
		['PATCH blog', `/api/admin/blogs/${blogId}`, { method: 'PATCH' }]
	]) {
		const result = await call(path, options);
		check(`${label} requires auth`, result.status === 401, `status ${result.status}`);
	}

	console.log('\nCleanup');
	let cleaned = 0;
	for (const id of createdIds) {
		const result = await call(`/api/admin/blogs/${id}`, { method: 'DELETE', headers: authHeaders });
		if (result.status === 200) cleaned += 1;
	}
	check('every test post was removed', cleaned === createdIds.length, `${cleaned}/${createdIds.length}`);

	const finalList = await call('/api/admin/blogs', { headers: authHeaders });
	check('no test posts remain', !(finalList.body.blogs || []).some((b) => String(b.title).includes(String(stamp))));

	console.log(`\n${passed} passed, ${failed} failed`);
	process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
	console.error('Content smoke run crashed:', err);
	process.exit(1);
});
