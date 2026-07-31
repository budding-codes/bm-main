const env = require('./src/config/env');
const { connectDatabase } = require('./src/config/database');
const { createApp } = require('./src/app');

const app = createApp();

app.listen(env.port, () => {
	console.log(`Server is running on port ${env.port}`);
});

// Started alongside the listener rather than before it, so a slow database does not
// delay the port opening and fail a platform health check.
connectDatabase().catch((err) => {
	console.error('MongoDB connection error:', err.message);
	process.exit(1);
});
