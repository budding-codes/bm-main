const { connectDatabase } = require('../config/database');
const env = require('../config/env');
const blogService = require('../services/blogService');
const { resolveSiteOrigin } = require('../seo/site');
const { buildSitemapXml } = require('../seo/sitemap');
const logger = require('../utils/logger');

async function getSitemap(req, res) {
	const origin = resolveSiteOrigin(env.siteUrl);
	let blogs = [];

	try {
		await connectDatabase();
		blogs = await blogService.listSitemapBlogs();
	} catch (error) {
		// A database outage must not take the sitemap down: static public URLs
		// are still valid, and Google retries more happily on 200 than on 503.
		logger.error('sitemap.blogs_unavailable', {
			requestId: req.id,
			error: error && error.name,
			reason: error && error.message
		});
	}

	const xml = buildSitemapXml(origin, blogs);

	res.setHeader('Content-Type', 'application/xml; charset=utf-8');
	res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=3600');
	res.status(200).send(xml);
}

module.exports = { getSitemap };
