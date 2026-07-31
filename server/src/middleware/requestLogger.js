const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Assigns a request id and echoes it back, so a browser error report can be tied
 * to the exact server-side log line. Reuses the platform's id when present.
 */
function requestContext(req, res, next) {
	const id = req.headers['x-request-id'] || req.headers['x-vercel-id'] || crypto.randomUUID();

	req.id = String(id);
	res.setHeader('X-Request-Id', req.id);

	next();
}

/** Query strings can carry search terms and ids; only the keys are logged. */
function queryKeys(query) {
	const keys = Object.keys(query || {});
	return keys.length ? keys.join(',') : undefined;
}

function requestLogger(req, res, next) {
	const startedAt = process.hrtime.bigint();
	// Captured up front: routers rewrite `req.url` while dispatching, so reading the
	// path after the response has finished can report a mount-relative path.
	const path = req.originalUrl.split('?')[0];

	res.on('finish', () => {
		const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
		const isPreflight = req.method === 'OPTIONS';

		logger.info(isPreflight ? 'http.preflight' : 'http.request', {
			requestId: req.id,
			method: req.method,
			path,
			query: queryKeys(req.query),
			status: res.statusCode,
			durationMs: Math.round(durationMs),
			origin: req.headers.origin,
			// Present only when the origin passed validation, so its absence on a
			// cross-origin response immediately identifies a rejected origin.
			corsAllowed: req.headers.origin ? Boolean(res.getHeader('Access-Control-Allow-Origin')) : undefined,
			ip: req.ip
		});
	});

	next();
}

module.exports = { requestContext, requestLogger };
