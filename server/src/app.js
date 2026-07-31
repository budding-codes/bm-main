const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp() {
	const app = express();

	app.use(cors({
		origin(origin, callback) {
			// Requests without an Origin header (curl, server-to-server) are not browser
			// requests, so there is no cross-origin policy to enforce.
			if (!origin || env.allowedOrigins.includes(origin)) {
				return callback(null, true);
			}

			return callback(null, false);
		},
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
		optionsSuccessStatus: 204
	}));

	app.use(express.json({ limit: env.jsonBodyLimit }));

	app.use('/api', apiRoutes);

	app.get('/', (req, res) => {
		res.send(`Server is running on port ${env.port}`);
	});

	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
}

module.exports = { createApp };
