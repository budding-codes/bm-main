const mongoose = require('mongoose');
const env = require('./env');

async function connectDatabase() {
	if (!env.mongoUri) {
		throw new Error('Missing MONGO_URI environment variable.');
	}

	await mongoose.connect(env.mongoUri);
	console.log('MongoDB connected');

	return mongoose.connection;
}

module.exports = { connectDatabase };
