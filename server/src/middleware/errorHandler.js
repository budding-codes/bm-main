const { HttpError } = require('../utils/httpError');
const logger = require('../utils/logger');

function notFoundHandler(req, res) {
	logger.warn('http.not_found', { requestId: req.id, method: req.method, path: req.path });

	res.status(404).json({ error: 'Not found.', requestId: req.id });
}

/**
 * Only HttpError messages reach the client. Everything else is logged in full and
 * reported as a generic 500 so internals are never exposed.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity.
function errorHandler(err, req, res, next) {
	if (err instanceof HttpError) {
		logger.warn('http.handled_error', {
			requestId: req.id,
			method: req.method,
			path: req.path,
			status: err.status,
			reason: err.message
		});

		return res.status(err.status).json({ error: err.message, requestId: req.id });
	}

	if (err && err.type === 'entity.too.large') {
		logger.warn('http.payload_too_large', { requestId: req.id, method: req.method, path: req.path });

		return res.status(413).json({ error: 'Request body is too large.', requestId: req.id });
	}

	if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) {
		logger.warn('http.invalid_json', { requestId: req.id, method: req.method, path: req.path });

		return res.status(400).json({ error: 'Request body is not valid JSON.', requestId: req.id });
	}

	logger.error('http.unhandled_error', {
		requestId: req.id,
		method: req.method,
		path: req.path,
		origin: req.headers && req.headers.origin,
		error: err && err.name,
		reason: err && err.message,
		stack: err && err.stack
	});

	res.status(500).json({
		error: (err && err.publicMessage) || 'Something went wrong.',
		requestId: req.id
	});
}

module.exports = { notFoundHandler, errorHandler };
