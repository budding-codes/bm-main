const crypto = require('crypto');
const env = require('../config/env');

function signPayload(encodedPayload, secret) {
	return crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function safeEquals(a, b) {
	const bufferA = Buffer.from(String(a));
	const bufferB = Buffer.from(String(b));

	if (bufferA.length !== bufferB.length) {
		return false;
	}

	return crypto.timingSafeEqual(bufferA, bufferB);
}

function signAdminToken(payload) {
	const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

	return `${encodedPayload}.${signPayload(encodedPayload, env.adminTokenSecret)}`;
}

/**
 * Returns the decoded payload for a valid, unexpired token, or null.
 * Accepts any of the configured verify secrets so a secret can be rotated
 * without invalidating live sessions.
 */
function verifyAdminToken(token) {
	if (!token || !token.includes('.')) {
		return null;
	}

	const [encodedPayload, signature] = token.split('.');
	const signatureMatches = env.adminTokenVerifySecrets
		.some((secret) => safeEquals(signature, signPayload(encodedPayload, secret)));

	if (!signatureMatches) {
		return null;
	}

	try {
		const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
		if (!payload.exp || payload.exp < Date.now()) {
			return null;
		}
		return payload;
	} catch (error) {
		return null;
	}
}

function authenticateAdmin(email, password) {
	const normalizedEmail = String(email || '').trim().toLowerCase();
	const candidatePassword = String(password || '');

	if (normalizedEmail !== env.adminEmail.toLowerCase() || candidatePassword !== env.adminPassword) {
		return null;
	}

	const expiresAt = Date.now() + env.tokenTtlMs;

	return {
		token: signAdminToken({ email: env.adminEmail, exp: expiresAt }),
		admin: { email: env.adminEmail },
		expiresAt
	};
}

module.exports = { signAdminToken, verifyAdminToken, authenticateAdmin };
