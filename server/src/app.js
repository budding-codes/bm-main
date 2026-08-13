const express = require('express');
const helmet = require('helmet');
const env = require('./config/env');
const { corsMiddleware } = require('./config/cors');
const { connectDatabase, describeDatabase } = require('./config/database');
const apiRoutes = require('./routes');
const { requestContext, requestLogger } = require('./middleware/requestLogger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const seoController = require('./controllers/seoController');
const { asyncHandler } = require('./utils/asyncHandler');
const logger = require('./utils/logger');

function reportConfigIssues() {
	env.describeConfigIssues().forEach((issue) => {
		logger[issue.level]('config.issue', { detail: issue.message });
	});
}

/**
 * Middleware order is deliberate:
 *
 *   request id → logging → helmet → CORS → body parser → routes → 404 → errors
 *
 * CORS runs before the body parser so that a malformed or oversized payload is
 * answered with CORS headers attached. Without that ordering the browser reports a
 * body-parser failure as a CORS error and hides the real status code.
 */
function createApp() {
	const app = express();

	reportConfigIssues();

	// Vercel terminates TLS at the edge; without this, req.protocol and req.ip
	// describe the proxy instead of the client.
	app.set('trust proxy', 1);
	app.disable('x-powered-by');

	app.use(requestContext);
	app.use(requestLogger);

	app.use(helmet({
		// This is a JSON API consumed from another origin. The default same-origin
		// resource policy is meant for asset hosts and only gets in the way here.
		crossOriginResourcePolicy: { policy: 'cross-origin' },
		contentSecurityPolicy: false
	}));

	// Registered once, for every route and method. The cors package answers the
	// preflight itself and ends the response, so OPTIONS never reaches a route
	// handler or any authentication middleware.
	app.use(corsMiddleware);

	app.use(express.json({ limit: env.jsonBodyLimit }));

	app.get(['/api/health', '/health'], async (req, res) => {
		const deep = req.query.deep === '1' || req.query.deep === 'true';
		const database = describeDatabase();

		if (deep && database.configured) {
			try {
				await connectDatabase();
				database.state = 'connected';
			} catch (error) {
				database.state = 'unreachable';
				database.error = error.message;
			}
		}

		const healthy = !deep || database.state === 'connected' || !database.configured;

		res.status(healthy ? 200 : 503).json({
			status: healthy ? 'ok' : 'degraded',
			environment: env.vercelEnv || env.nodeEnv,
			commit: env.commitSha || undefined,
			uptimeSeconds: Math.round(process.uptime()),
			database,
			cloudinary: { configured: env.cloudinary.isConfigured },
			allowedOrigins: env.allowedOrigins.length,
			requestId: req.id
		});
	});

	// Registered before `/api` so `/api/sitemap.xml` is not captured by the API
	// router's 404 handler. Both paths share one generator: the frontend proxies
	// `/sitemap.xml` here in production, and the Vite `/api` proxy covers local use.
	app.get(
		['/sitemap.xml', '/api/sitemap.xml'],
		asyncHandler(seoController.getSitemap, 'Failed to generate sitemap.')
	);

	app.use('/api', apiRoutes);

	app.get('/', (req, res) => {
		res.json({ service: 'bm-promo-api', status: 'ok', environment: env.vercelEnv || env.nodeEnv });
	});

	app.use(notFoundHandler);
	app.use(errorHandler);

	logger.info('app.ready', {
		environment: env.vercelEnv || env.nodeEnv,
		serverless: env.isServerless,
		allowedOrigins: env.allowedOrigins.length,
		allowedOriginPatterns: env.allowedOriginPatternSources.length
	});

	return app;
}

module.exports = { createApp };
