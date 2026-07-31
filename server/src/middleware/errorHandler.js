const { HttpError } = require('../utils/httpError');

function notFoundHandler(req, res) {
	res.status(404).json({ error: 'Not found.' });
}

/**
 * Only HttpError messages reach the client. Everything else is logged and
 * reported as a generic 500 so internals are never exposed.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity.
function errorHandler(err, req, res, next) {
	if (err instanceof HttpError) {
		return res.status(err.status).json({ error: err.message });
	}

	if (err && err.type === 'entity.too.large') {
		return res.status(413).json({ error: 'Request body is too large.' });
	}

	console.error(`[error] ${req.method} ${req.originalUrl}`, err);

	res.status(500).json({ error: (err && err.publicMessage) || 'Something went wrong.' });
}

module.exports = { notFoundHandler, errorHandler };
