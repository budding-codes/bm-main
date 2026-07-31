/**
 * Brings existing blog documents up to the current schema version.
 *
 *   node scripts/migrate.js --dry-run   inspect the plan without writing
 *   node scripts/migrate.js             apply
 *
 * Safe to run repeatedly: documents already at the current version are skipped,
 * and no existing field value is overwritten.
 */
const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/database');
const Blog = require('../src/models/Blog');
const { BLOG_STATUS, CURRENT_BLOG_SCHEMA_VERSION } = require('../src/constants/blog');
const { generateSlug } = require('../src/utils/slug');
const { htmlToText, countWords, estimateReadingTime } = require('../src/utils/text');

const DRY_RUN = process.argv.includes('--dry-run');

function deriveStatus(blog) {
	return blog.published === false ? BLOG_STATUS.DRAFT : BLOG_STATUS.PUBLISHED;
}

/**
 * Slugs are resolved against slugs already in the database *and* those assigned
 * earlier in this run, so a dry run reports the same result as a real one.
 */
function makeSlugResolver(existingSlugs) {
	const taken = new Set(existingSlugs);

	return function resolve(title, id) {
		const base = generateSlug(title) || `post-${String(id).slice(-6)}`;
		let slug = base;
		let suffix = 1;

		while (taken.has(slug)) {
			suffix += 1;
			slug = `${base}-${suffix}`;
		}

		taken.add(slug);
		return slug;
	};
}

async function main() {
	await connectDatabase();

	const blogs = await Blog.find({}).lean();
	console.log(`\nFound ${blogs.length} blog document(s).`);

	const existingSlugs = blogs.map((blog) => blog.slug).filter(Boolean);
	const resolveSlug = makeSlugResolver(existingSlugs);

	const operations = [];
	let skipped = 0;

	for (const blog of blogs) {
		const update = {};

		if (!blog.slug) {
			update.slug = resolveSlug(blog.title, blog._id);
		}

		if (!blog.status) {
			update.status = deriveStatus(blog);
		}

		const effectiveStatus = update.status || blog.status;
		if (!blog.publishedAt && effectiveStatus === BLOG_STATUS.PUBLISHED) {
			update.publishedAt = blog.createdAt || new Date();
		}

		// Pre-rich-text posts have no contentBlocks. Derive the reading metrics from
		// the description so the reader UI has something meaningful to show.
		if (!blog.wordCount) {
			const text = blog.contentHtml ? htmlToText(blog.contentHtml) : String(blog.description || '');
			const words = countWords(text);
			if (words) {
				update.wordCount = words;
				update.readingTimeMinutes = estimateReadingTime(words);
				if (!blog.contentText) {
					update.contentText = text;
				}
			}
		}

		if (blog.schemaVersion !== CURRENT_BLOG_SCHEMA_VERSION) {
			update.schemaVersion = CURRENT_BLOG_SCHEMA_VERSION;
		}

		if (Object.keys(update).length === 0) {
			skipped += 1;
			continue;
		}

		operations.push({ blog, update });
	}

	console.log(`${operations.length} document(s) need updating, ${skipped} already current.\n`);

	for (const { blog, update } of operations) {
		const changes = Object.entries(update)
			.map(([key, value]) => `${key}=${JSON.stringify(value)}`)
			.join(', ');
		console.log(`  ${blog._id}  ${JSON.stringify(blog.title).slice(0, 48)}`);
		console.log(`      ${changes}`);
	}

	if (DRY_RUN) {
		console.log('\nDry run: nothing was written.');
	} else if (operations.length > 0) {
		const result = await Blog.bulkWrite(operations.map(({ blog, update }) => ({
			updateOne: { filter: { _id: blog._id }, update: { $set: update } }
		})));
		console.log(`\nApplied. ${result.modifiedCount} document(s) modified.`);
	} else {
		console.log('\nNothing to do.');
	}

	// Builds the new indexes, including the sparse unique index on slug.
	if (!DRY_RUN) {
		console.log('\nSynchronising indexes...');
		await Blog.syncIndexes();
		await require('../src/models/MediaAsset').syncIndexes();
		await require('../src/models/BlogRevision').syncIndexes();
		console.log('Indexes are up to date.');
	}

	await mongoose.disconnect();
}

main().catch(async (err) => {
	console.error('Migration failed:', err);
	await mongoose.disconnect().catch(() => {});
	process.exit(1);
});
