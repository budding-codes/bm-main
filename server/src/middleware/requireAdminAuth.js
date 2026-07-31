const { verifyAdminToken } = require('../services/authService');

function requireAdminAuth(req, res, next) {
	const authHeader = req.headers.authorization || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
	const payload = verifyAdminToken(token);

	if (!payload) {
		return res.status(401).json({ error: 'Unauthorized.' });
	}

	req.admin = payload;
	next();
}

module.exports = { requireAdminAuth };
