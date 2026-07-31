const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');
const { HttpError } = require('../utils/httpError');

const READY_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

/**
 * The connection is cached on the global object rather than in module scope.
 *
 * A serverless runtime reuses the process across invocations but may re-evaluate
 * modules, and opening a new connection pool per request exhausts the database's
 * connection limit. Holding it on `global` survives both.
 */
const cache = global.__bmMongooseCache || (global.__bmMongooseCache = { conn: null, promise: null });

function connectionState() {
	return READY_STATES[mongoose.connection.readyState] || 'unknown';
}

function isConnected() {
	return mongoose.connection.readyState === 1;
}

/**
 * Opens the connection, or returns the in-flight/established one.
 *
 * Never calls `process.exit`. A database outage must degrade the endpoints that
 * need data, not take down the whole function — including CORS preflights and the
 * admin login, which do not touch the database at all.
 */
async function connectDatabase() {
	if (!env.mongoUri) {
		throw new Error('MONGO_URI is not set.');
	}

	if (cache.conn && isConnected()) {
		return cache.conn;
	}

	if (!cache.promise) {
		const startedAt = Date.now();

		cache.promise = mongoose
			.connect(env.mongoUri, {
				serverSelectionTimeoutMS: env.database.serverSelectionTimeoutMs,
				socketTimeoutMS: env.database.socketTimeoutMs,
				maxPoolSize: env.database.maxPoolSize
			})
			.then((instance) => {
				logger.info('database.connected', {
					durationMs: Date.now() - startedAt,
					database: instance.connection.name
				});
				return instance.connection;
			})
			.catch((error) => {
				// Cleared so the next request retries instead of reusing a rejected promise.
				cache.promise = null;
				logger.error('database.connect_failed', {
					durationMs: Date.now() - startedAt,
					error: error.name,
					reason: error.message
				});
				throw error;
			});
	}

	cache.conn = await cache.promise;

	return cache.conn;
}

/**
 * Gate for routes that read or write data. Endpoints without this middleware keep
 * working while the database is unreachable.
 */
async function ensureDatabase(req, res, next) {
	try {
		await connectDatabase();
		next();
	} catch (error) {
		next(new HttpError(503, 'The database is temporarily unavailable. Please try again shortly.'));
	}
}

function describeDatabase() {
	return {
		configured: Boolean(env.mongoUri),
		state: connectionState()
	};
}

module.exports = { connectDatabase, ensureDatabase, describeDatabase, isConnected };
