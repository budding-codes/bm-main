const env = require('../config/env');

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = LEVELS[env.logLevel] || LEVELS.info;

/** Field names that must never appear in a log line, whatever the caller passes. */
const REDACTED_KEYS = /^(password|token|authorization|cookie|secret|apikey|api_key|mongouri|mongo_uri)$/i;

function redact(fields) {
	const safe = {};

	Object.entries(fields || {}).forEach(([key, value]) => {
		if (REDACTED_KEYS.test(key)) {
			safe[key] = '[redacted]';
			return;
		}

		safe[key] = value instanceof Error ? { name: value.name, message: value.message } : value;
	});

	return safe;
}

/**
 * One JSON object per line. Vercel, CloudWatch and most log drains parse this
 * shape natively, which keeps production debugging to a single query.
 */
function write(level, message, fields) {
	if (LEVELS[level] < threshold) {
		return;
	}

	const entry = {
		level,
		time: new Date().toISOString(),
		message,
		...redact(fields)
	};

	if (env.commitSha) {
		entry.commit = env.commitSha;
	}

	const line = JSON.stringify(entry);

	if (level === 'error') {
		console.error(line);
		return;
	}

	if (level === 'warn') {
		console.warn(line);
		return;
	}

	console.log(line);
}

module.exports = {
	debug: (message, fields) => write('debug', message, fields),
	info: (message, fields) => write('info', message, fields),
	warn: (message, fields) => write('warn', message, fields),
	error: (message, fields) => write('error', message, fields)
};
