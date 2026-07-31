const mongoose = require('mongoose');

const UserInfoSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	phone: { type: String, required: true, trim: true },
	email: { type: String, required: false, trim: true },
	called: { type: String, default: 'Not Yet' },
	interested: { type: String, default: 'Not Yet' }
}, { timestamps: true });

module.exports = mongoose.models.UserInfo || mongoose.model('UserInfo', UserInfoSchema);
