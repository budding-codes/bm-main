/**
 * Long-running server, used for local development and any container or VM host.
 *
 * The serverless entrypoint is `api/index.js`; both share the same app factory so
 * the two environments cannot drift apart.
 */
const env = require('./src/config/env');
const { connectDatabase } = require('./src/config/database');
const { createApp } = require('./src/app');
const logger = require('./src/utils/logger');

const app = createApp();

const server = app.listen(env.port, () => {
	logger.info('server.listening', { port: env.port, environment: env.nodeEnv });
});

// Started alongside the listener rather than before it, so a slow database does not
// delay the port opening. A failure is logged and retried per request by the
// database gate instead of ending the process.
connectDatabase().catch(() => {});

function shutdown(signal) {
	logger.info('server.shutdown', { signal });

	server.close(() => process.exit(0));

	// Forced exit if connections do not drain, so a deploy is never blocked.
	setTimeout(() => process.exit(1), 10000).unref();
}

['SIGTERM', 'SIGINT'].forEach((signal) => process.on(signal, () => shutdown(signal)));

process.on('unhandledRejection', (reason) => {
	logger.error('process.unhandled_rejection', {
		reason: reason instanceof Error ? reason.message : String(reason),
		stack: reason instanceof Error ? reason.stack : undefined
	});
});

module.exports = app;
