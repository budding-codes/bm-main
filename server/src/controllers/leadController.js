const leadService = require('../services/leadService');

async function create(req, res) {
	const { name, phone, email } = req.body;
	await leadService.createLead({ name, phone, email });

	res.status(200).json({ message: 'User info stored successfully.' });
}

async function listAsUsers(req, res) {
	const users = await leadService.listLeads();
	res.json({ users });
}

async function list(req, res) {
	const leads = await leadService.listLeads();
	res.json({ leads });
}

async function update(req, res) {
	const { called, interested } = req.body;
	await leadService.updateLead(req.params.id, { called, interested });

	res.json({ message: 'Lead updated.' });
}

module.exports = { create, listAsUsers, list, update };
