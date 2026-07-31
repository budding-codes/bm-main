/**
 * Serverless entrypoint.
 *
 * The platform imports this module and invokes the exported handler; it must not
 * call `listen`, and it must not exit the process. The long-running server used in
 * local development lives in `server.js`, and both share the same app factory.
 */

/**
 * Last-resort handler used when the application cannot be constructed.
 *
 * Deliberately dependency-free. If the app fails to load, an uncaught error here
 * would leave the platform to answer with an opaque invocation failure that carries
 * no CORS headers — which a browser reports as "No 'Access-Control-Allow-Origin'
 * header is present", sending everyone to debug CORS instead of the real fault.
 * This answers preflights correctly and returns a plain 503 for everything else, so
 * the failure is legible from the browser and from the logs.
 */
function createBootFailureHandler(error) {
	const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
		.split(/[\s,]+/)
		.map((origin) => origin.trim().replace(/\/$/, ''))
		.filter(Boolean);

	console.error(JSON.stringify({
		level: 'error',
		time: new Date().toISOString(),
		message: 'app.bootstrap_failed',
		error: error && error.name,
		code: error && error.code,
		reason: error && error.message,
		stack: error && error.stack
	}));

	return (req, res) => {
		const origin = (req.headers.origin || '').replace(/\/$/, '');

		if (origin && allowedOrigins.includes(origin)) {
			res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
			res.setHeader('Vary', 'Origin');
			res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');
			res.setHeader('Access-Control-Allow-Headers', 'Accept,Authorization,Content-Type,X-Requested-With');
		}

		if (req.method === 'OPTIONS') {
			res.statusCode = 204;
			res.end();
			return;
		}

		res.statusCode = 503;
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({ error: 'The API is starting up or misconfigured. Please try again shortly.' }));
	};
}

let handler;

try {
	const { createApp } = require('../src/app');
	handler = createApp();
} catch (error) {
	handler = createBootFailureHandler(error);
}

// A rejected promise or uncaught error would otherwise tear down the runtime and
// take every subsequent request with it. Logged, then left to the error middleware.
process.on('unhandledRejection', (reason) => {
	console.error(JSON.stringify({
		level: 'error',
		time: new Date().toISOString(),
		message: 'process.unhandled_rejection',
		reason: reason instanceof Error ? reason.message : String(reason),
		stack: reason instanceof Error ? reason.stack : undefined
	}));
});

process.on('uncaughtException', (error) => {
	console.error(JSON.stringify({
		level: 'error',
		time: new Date().toISOString(),
		message: 'process.uncaught_exception',
		reason: error.message,
		stack: error.stack
	}));
});

module.exports = handler;
