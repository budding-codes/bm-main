const crypto = require('crypto');

require('dotenv').config();

/**
 * Origins that are always trusted, so a deployment still works if ALLOWED_ORIGINS
 * has not been set yet. ALLOWED_ORIGINS, when present, replaces this list.
 */
const DEFAULT_ALLOWED_ORIGINS = [
	'https://www.buddingmariners.com',
	'https://buddingmariners.com',
	'https://bm-promo.vercel.app',
	'http://localhost:5173',
	'http://127.0.0.1:5173',
	'http://localhost:3000',
	'http://127.0.0.1:3000'
];

/**
 * Wildcard origin patterns. Used for Vercel preview deployments, whose hostnames
 * contain a per-deployment hash and therefore cannot be enumerated ahead of time.
 * Override with ALLOWED_ORIGIN_PATTERNS.
 */
const DEFAULT_ALLOWED_ORIGIN_PATTERNS = [
	'https://*.vercel.app'
];

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

/** Accepts comma, newline or whitespace separated lists so any env UI format works. */
function parseList(value, fallback) {
	const raw = (value || '').trim();
	if (!raw) {
		return fallback;
	}

	return raw
		.split(/[\s,]+/)
		.map((item) => item.trim().replace(/\/$/, ''))
		.filter(Boolean);
}

/**
 * Converts `https://*.vercel.app` into an anchored regular expression.
 * Everything except `*` is escaped, so a pattern can never match more than intended.
 */
function toOriginPattern(pattern) {
	const escaped = pattern
		.trim()
		.replace(/\/$/, '')
		.replace(/[.*+?^${}()|[\]\\]/g, (char) => (char === '*' ? '\u0000' : `\\${char}`))
		.replace(/\u0000/g, '[a-zA-Z0-9-]+');

	return new RegExp(`^${escaped}$`);
}

// Tokens are signed with the primary secret. The previous secret is verify-only so it can be
// rotated without invalidating sessions that are still in flight.
const adminTokenSecret = process.env.ADMIN_TOKEN_SECRET || crypto.randomBytes(48).toString('base64url');
const adminTokenSecretPrevious = process.env.ADMIN_TOKEN_SECRET_PREVIOUS || '';

const allowedOrigins = parseList(process.env.ALLOWED_ORIGINS, DEFAULT_ALLOWED_ORIGINS);
const allowedOriginPatternSources = parseList(
	process.env.ALLOWED_ORIGIN_PATTERNS,
	DEFAULT_ALLOWED_ORIGIN_PATTERNS
);

const env = {
	nodeEnv,
	isProduction,
	// Vercel sets VERCEL=1 in every build and runtime. Used to pick serverless-safe behaviour.
	isServerless: process.env.VERCEL === '1',
	vercelEnv: process.env.VERCEL_ENV || '',
	commitSha: (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7),

	port: Number(process.env.PORT) || 5000,
	mongoUri: process.env.MONGO_URI || '',

	adminEmail: process.env.ADMIN_EMAIL || process.env.ADMIN_ID || 'admin@bmpromo.com',
	adminPassword: process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || 'bmpromoadmin$',
	adminTokenSecret,
	adminTokenVerifySecrets: [adminTokenSecret, adminTokenSecretPrevious].filter(Boolean),
	adminTokenSecretIsGenerated: !process.env.ADMIN_TOKEN_SECRET,
	tokenTtlMs: 1000 * 60 * 60 * 12,

	jsonBodyLimit: process.env.JSON_BODY_LIMIT || '5mb',

	allowedOrigins,
	allowedOriginPatternSources,
	allowedOriginPatterns: allowedOriginPatternSources.map(toOriginPattern),
	allowedOriginsAreDefaults: !((process.env.ALLOWED_ORIGINS || '').trim()),

	database: {
		// Kept below the platform's function timeout so a database outage surfaces as a
		// clean 503 rather than a killed invocation.
		serverSelectionTimeoutMs: Number(process.env.DB_SERVER_SELECTION_TIMEOUT_MS) || 8000,
		socketTimeoutMs: Number(process.env.DB_SOCKET_TIMEOUT_MS) || 20000,
		maxPoolSize: Number(process.env.DB_MAX_POOL_SIZE) || 10
	},

	logLevel: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

	cloudinary: {
		cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
		apiKey: process.env.CLOUDINARY_API_KEY || '',
		apiSecret: process.env.CLOUDINARY_API_SECRET || ''
	}
};

env.cloudinary.isConfigured = Boolean(
	env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
);

/**
 * Configuration problems worth surfacing at boot.
 *
 * These are reported, never thrown: a serverless function that exits during startup
 * fails every request with an opaque platform error, including the CORS preflight,
 * which makes the real problem invisible from the browser.
 */
function describeConfigIssues() {
	const issues = [];

	if (!env.mongoUri) {
		issues.push({ level: 'error', message: 'MONGO_URI is not set. Database-backed endpoints will return 503.' });
	}

	if (env.adminTokenSecretIsGenerated) {
		issues.push({
			level: 'error',
			message: 'ADMIN_TOKEN_SECRET is not set. A random secret was generated, so every admin session ends when this process restarts.'
		});
	}

	if (!env.cloudinary.isConfigured) {
		const missing = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
			.filter((key) => !process.env[key]);
		issues.push({
			level: 'warn',
			message: `Cloudinary is not configured (missing ${missing.join(', ')}). Upload endpoints will return 503.`
		});
	}

	if (env.isProduction && env.allowedOriginsAreDefaults) {
		issues.push({
			level: 'warn',
			message: 'ALLOWED_ORIGINS is not set. Falling back to the built-in origin list.'
		});
	}

	if (env.isProduction && !process.env.ADMIN_EMAIL && !process.env.ADMIN_ID) {
		issues.push({ level: 'error', message: 'No admin identity configured. Set ADMIN_EMAIL and ADMIN_PASSWORD.' });
	}

	return issues;
}

module.exports = env;
module.exports.describeConfigIssues = describeConfigIssues;
module.exports.DEFAULT_ALLOWED_ORIGINS = DEFAULT_ALLOWED_ORIGINS;
