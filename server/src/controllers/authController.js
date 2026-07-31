const { authenticateAdmin } = require('../services/authService');

function login(req, res) {
	const session = authenticateAdmin(req.body.email, req.body.password);

	if (!session) {
		return res.status(401).json({ error: 'Invalid credentials.' });
	}

	res.json(session);
}

function session(req, res) {
	res.json({ admin: { email: req.admin.email } });
}

module.exports = { login, session };
