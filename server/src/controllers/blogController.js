const blogService = require('../services/blogService');

function actorOf(req) {
	return req.admin?.email || '';
}

async function listPublished(req, res) {
	const blogs = await blogService.listPublishedBlogs();
	res.json({ blogs });
}

async function getBySlug(req, res) {
	const blog = await blogService.getPublishedBlogBySlug(req.params.slug);
	res.json({ blog });
}

async function listAll(req, res) {
	const blogs = await blogService.listAllBlogs();
	res.json({ blogs });
}

async function getOne(req, res) {
	const blog = await blogService.getBlogById(req.params.id);
	res.json({ blog });
}

async function create(req, res) {
	const blog = await blogService.createBlog(req.body, actorOf(req));
	res.status(201).json({ blog });
}

async function update(req, res) {
	const blog = await blogService.updateBlog(req.params.id, req.body, actorOf(req));
	res.json({ blog });
}

/** Partial update for card-level toggles; deliberately does not create a revision. */
async function patch(req, res) {
	const blog = await blogService.updateBlog(req.params.id, req.body, actorOf(req), { recordHistory: false });
	res.json({ blog });
}

async function remove(req, res) {
	await blogService.deleteBlog(req.params.id);
	res.json({ message: 'Blog deleted.' });
}

async function saveDraft(req, res) {
	const result = await blogService.saveDraft(req.params.id, req.body, actorOf(req));
	res.json({ draft: result.draft, savedAt: result.draft?.savedAt });
}

async function discardDraft(req, res) {
	const result = await blogService.discardDraft(req.params.id);
	res.json({ draft: result.draft });
}

async function listRevisions(req, res) {
	const revisions = await blogService.listRevisions(req.params.id);
	res.json({ revisions });
}

async function getRevision(req, res) {
	const revision = await blogService.getRevision(req.params.id, req.params.revisionNumber);
	res.json({ revision });
}

async function restoreRevision(req, res) {
	const blog = await blogService.restoreRevision(req.params.id, req.params.revisionNumber, actorOf(req));
	res.json({ blog });
}

module.exports = {
	listPublished,
	getBySlug,
	listAll,
	getOne,
	create,
	update,
	patch,
	remove,
	saveDraft,
	discardDraft,
	listRevisions,
	getRevision,
	restoreRevision
};
