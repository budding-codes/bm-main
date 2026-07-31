const crypto = require('crypto');

require('dotenv').config();

const DEFAULT_ALLOWED_ORIGINS = [
	'https://www.buddingmariners.com',
	'https://buddingmariners.com',
	'https://bm-promo.vercel.app',
	'http://localhost:5173',
	'http://127.0.0.1:5173'
];

function parseList(value, fallback) {
	const raw = (value || '').trim();
	if (!raw) {
		return fallback;
	}

	return raw.split(',').map((item) => item.trim()).filter(Boolean);
}

// Tokens are signed with the primary secret. The previous secret is verify-only so it can be
// rotated without invalidating sessions that are still in flight.
const adminTokenSecret = process.env.ADMIN_TOKEN_SECRET || crypto.randomBytes(48).toString('base64url');
const adminTokenSecretPrevious = process.env.ADMIN_TOKEN_SECRET_PREVIOUS || '';

if (!process.env.ADMIN_TOKEN_SECRET) {
	console.warn(
		'[security] ADMIN_TOKEN_SECRET is not set. A random secret was generated for this process, ' +
		'so every admin session ends when the server restarts. Set ADMIN_TOKEN_SECRET in the environment.'
	);
}

const env = {
	port: Number(process.env.PORT) || 5000,
	mongoUri: process.env.MONGO_URI,

	adminEmail: process.env.ADMIN_EMAIL || process.env.ADMIN_ID || 'admin@bmpromo.com',
	adminPassword: process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || 'bmpromoadmin$',
	adminTokenSecret,
	adminTokenVerifySecrets: [adminTokenSecret, adminTokenSecretPrevious].filter(Boolean),
	tokenTtlMs: 1000 * 60 * 60 * 12,

	jsonBodyLimit: process.env.JSON_BODY_LIMIT || '5mb',
	allowedOrigins: parseList(process.env.ALLOWED_ORIGINS, DEFAULT_ALLOWED_ORIGINS),

	cloudinary: {
		cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
		apiKey: process.env.CLOUDINARY_API_KEY || '',
		apiSecret: process.env.CLOUDINARY_API_SECRET || ''
	}
};

env.cloudinary.isConfigured = Boolean(
	env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
);

module.exports = env;
