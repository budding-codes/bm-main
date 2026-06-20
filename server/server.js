const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.ADMIN_ID || 'admin@bmpromo.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || 'bmpromoadmin$';
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'bm-promo-admin-secret';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || [
	'https://www.buddingmariners.com',
	'https://buddingmariners.com',
	'https://bm-promo.vercel.app',
	'http://localhost:5173',
	'http://127.0.0.1:5173'
].join(',')).split(',').map((origin) => origin.trim()).filter(Boolean);

const corsOptions = {
	origin(origin, callback) {
		if (!origin || ALLOWED_ORIGINS.includes(origin)) {
			return callback(null, true);
		}

		return callback(null, false);
	},
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
	optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

if (!MONGO_URI) {
	console.error('Missing MONGO_URI environment variable.');
	process.exit(1);
}

mongoose.connect(MONGO_URI)
	.then(() => console.log('MongoDB connected'))
	.catch((err) => {
		console.error('MongoDB connection error:', err);
		process.exit(1);
	});

const UserInfoSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	phone: { type: String, required: true, trim: true },
	email: { type: String, required: false, trim: true },
	called: { type: String, default: 'Not Yet' },
	interested: { type: String, default: 'Not Yet' }
}, { timestamps: true });

const BlogSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true },
	description: { type: String, required: true, trim: true },
	author: { type: String, required: true, trim: true },
	youtubeUrl: { type: String, default: '', trim: true },
	thumbnailUrl: { type: String, default: '', trim: true },
	featured: { type: Boolean, default: false },
	published: { type: Boolean, default: true }
}, { timestamps: true });

const UserInfo = mongoose.model('UserInfo', UserInfoSchema);
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

function signAdminToken(payload) {
	const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
	const signature = crypto
		.createHmac('sha256', ADMIN_TOKEN_SECRET)
		.update(encodedPayload)
		.digest('base64url');

	return `${encodedPayload}.${signature}`;
}

function verifyAdminToken(token) {
	if (!token || !token.includes('.')) {
		return null;
	}

	const [encodedPayload, signature] = token.split('.');
	const expectedSignature = crypto
		.createHmac('sha256', ADMIN_TOKEN_SECRET)
		.update(encodedPayload)
		.digest('base64url');

	if (signature !== expectedSignature) {
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

function extractYouTubeVideoId(value) {
	if (!value) {
		return '';
	}

	try {
		const parsed = new URL(value);
		if (parsed.hostname === 'youtu.be') {
			return parsed.pathname.replace('/', '').trim();
		}

		if (parsed.hostname.includes('youtube.com')) {
			if (parsed.searchParams.get('v')) {
				return parsed.searchParams.get('v').trim();
			}

			const pathParts = parsed.pathname.split('/').filter(Boolean);
			if (pathParts[0] === 'shorts' || pathParts[0] === 'embed' || pathParts[0] === 'live') {
				return (pathParts[1] || '').trim();
			}
		}
	} catch (error) {
		return '';
	}

	return '';
}

function resolveThumbnailUrl({ youtubeUrl, thumbnailUrl }) {
	if (thumbnailUrl && thumbnailUrl.trim()) {
		return thumbnailUrl.trim();
	}

	const videoId = extractYouTubeVideoId(youtubeUrl);
	if (!videoId) {
		return '';
	}

	return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function normalizeBlogPayload(body) {
	return {
		title: String(body.title || '').trim(),
		description: String(body.description || '').trim(),
		author: String(body.author || '').trim() || 'BM Team',
		youtubeUrl: String(body.youtubeUrl || '').trim(),
		thumbnailUrl: resolveThumbnailUrl({
			youtubeUrl: body.youtubeUrl,
			thumbnailUrl: body.thumbnailUrl
		}),
		featured: Boolean(body.featured),
		published: body.published !== false
	};
}

async function ensureSingleFeaturedBlog(nextFeaturedId) {
	if (!nextFeaturedId) {
		return;
	}

	await Blog.updateMany({ _id: { $ne: nextFeaturedId } }, { $set: { featured: false } });
}

app.post('/api/store-user-info', async (req, res) => {
	const { name, phone, email } = req.body;
	if (!name || !phone) {
		return res.status(400).json({ error: 'Name and phone are required.' });
	}

	try {
		await UserInfo.create({ name, phone, email });
		res.status(200).json({ message: 'User info stored successfully.' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to store user info.' });
	}
});

app.get('/api/store-user-info', async (req, res) => {
	try {
		const users = await UserInfo.find().sort({ createdAt: -1 });
		res.json({ users });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch users.' });
	}
});

app.post('/api/admin/login', (req, res) => {
	const email = String(req.body.email || '').trim().toLowerCase();
	const password = String(req.body.password || '');

	if (email !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
		return res.status(401).json({ error: 'Invalid credentials.' });
	}

	const expiresAt = Date.now() + TOKEN_TTL_MS;
	const token = signAdminToken({ email: ADMIN_EMAIL, exp: expiresAt });

	res.json({
		token,
		admin: { email: ADMIN_EMAIL },
		expiresAt
	});
});

app.get('/api/admin/session', requireAdminAuth, (req, res) => {
	res.json({ admin: { email: req.admin.email } });
});

app.get('/api/admin/leads', requireAdminAuth, async (req, res) => {
	try {
		const leads = await UserInfo.find().sort({ createdAt: -1 });
		res.json({ leads });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch leads.' });
	}
});

app.patch('/api/admin/leads/:id', requireAdminAuth, async (req, res) => {
	const { id } = req.params;
	const { called, interested } = req.body;

	try {
		const update = {};
		if (called !== undefined) update.called = called;
		if (interested !== undefined) update.interested = interested;

		await UserInfo.findByIdAndUpdate(id, update);
		res.json({ message: 'Lead updated.' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to update lead.' });
	}
});

app.get('/api/blogs', async (req, res) => {
	try {
		const blogs = await Blog.find({ published: true }).sort({ featured: -1, createdAt: -1 });
		res.json({ blogs });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch blogs.' });
	}
});

app.get('/api/admin/blogs', requireAdminAuth, async (req, res) => {
	try {
		const blogs = await Blog.find().sort({ featured: -1, createdAt: -1 });
		res.json({ blogs });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch blogs.' });
	}
});

app.post('/api/admin/blogs', requireAdminAuth, async (req, res) => {
	const payload = normalizeBlogPayload(req.body);
	if (!payload.title || !payload.description) {
		return res.status(400).json({ error: 'Title and description are required.' });
	}

	try {
		const blog = await Blog.create(payload);
		if (blog.featured) {
			await ensureSingleFeaturedBlog(blog._id);
		}
		res.status(201).json({ blog });
	} catch (err) {
		res.status(500).json({ error: 'Failed to create blog.' });
	}
});

app.put('/api/admin/blogs/:id', requireAdminAuth, async (req, res) => {
	const payload = normalizeBlogPayload(req.body);
	if (!payload.title || !payload.description) {
		return res.status(400).json({ error: 'Title and description are required.' });
	}

	try {
		const blog = await Blog.findByIdAndUpdate(req.params.id, payload, {
			new: true,
			runValidators: true
		});

		if (!blog) {
			return res.status(404).json({ error: 'Blog not found.' });
		}

		if (blog.featured) {
			await ensureSingleFeaturedBlog(blog._id);
		}

		res.json({ blog });
	} catch (err) {
		res.status(500).json({ error: 'Failed to update blog.' });
	}
});

app.delete('/api/admin/blogs/:id', requireAdminAuth, async (req, res) => {
	try {
		const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
		if (!deletedBlog) {
			return res.status(404).json({ error: 'Blog not found.' });
		}

		res.json({ message: 'Blog deleted.' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to delete blog.' });
	}
});

app.get('/', (req, res) => {
	res.send(`Server is running on port ${PORT}`);
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
