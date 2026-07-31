const UserInfo = require('../models/UserInfo');
const { badRequest } = require('../utils/httpError');

function listLeads() {
	return UserInfo.find().sort({ createdAt: -1 });
}

function createLead({ name, phone, email }) {
	if (!name || !phone) {
		throw badRequest('Name and phone are required.');
	}

	return UserInfo.create({ name, phone, email });
}

function updateLead(id, { called, interested }) {
	const update = {};
	if (called !== undefined) update.called = called;
	if (interested !== undefined) update.interested = interested;

	return UserInfo.findByIdAndUpdate(id, update);
}

module.exports = { listLeads, createLead, updateLead };
