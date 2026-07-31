const cors = require('cors');
const env = require('./env');
const logger = require('../utils/logger');

/** Header names the browser is allowed to send on cross-origin requests. */
const ALLOWED_HEADERS = [
	'Accept',
	'Authorization',
	'Content-Type',
	'X-Requested-With'
];

/** Response headers the browser is allowed to read cross-origin. */
const EXPOSED_HEADERS = ['X-Request-Id'];

const METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

function normalizeOrigin(origin) {
	return String(origin || '').trim().replace(/\/$/, '');
}

/**
 * An origin is trusted when it is listed in ALLOWED_ORIGINS or matches one of the
 * ALLOWED_ORIGIN_PATTERNS wildcards (used for preview deployments).
 */
function isOriginAllowed(origin) {
	const candidate = normalizeOrigin(origin);

	if (!candidate) {
		return false;
	}

	if (env.allowedOrigins.includes(candidate)) {
		return true;
	}

	return env.allowedOriginPatterns.some((pattern) => pattern.test(candidate));
}

/**
 * Resolves the CORS policy for a single request.
 *
 * Rejection is signalled with `callback(null, false)`, never with an error: an error
 * here is handed to the error middleware and answers the preflight with a 500 that
 * carries no CORS headers, which the browser reports as the misleading
 * "No 'Access-Control-Allow-Origin' header is present".
 */
function resolveOrigin(origin, callback) {
	// No Origin header means a non-browser client (curl, health check, server-to-server).
	// There is no cross-origin policy to enforce and nothing to reflect.
	if (!origin) {
		return callback(null, true);
	}

	if (isOriginAllowed(origin)) {
		return callback(null, true);
	}

	logger.warn('cors.origin_rejected', { origin });

	return callback(null, false);
}

const corsOptions = {
	origin: resolveOrigin,
	methods: METHODS,
	allowedHeaders: ALLOWED_HEADERS,
	exposedHeaders: EXPOSED_HEADERS,
	// The API authenticates with a bearer token rather than cookies, so credentials
	// stay off. This also keeps the policy compatible with a reflected origin.
	credentials: false,
	// Lets the browser cache the preflight for a day instead of re-issuing it per request.
	maxAge: 86400,
	// 204 keeps preflight responses body-less; some legacy clients choke on 204, but
	// none of ours do, and it avoids a needless payload on every cross-origin request.
	optionsSuccessStatus: 204
};

module.exports = {
	corsMiddleware: cors(corsOptions),
	corsOptions,
	isOriginAllowed,
	ALLOWED_HEADERS,
	EXPOSED_HEADERS,
	METHODS
};
