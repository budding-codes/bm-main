const MediaAsset = require('../models/MediaAsset');
const cloudinaryService = require('./cloudinaryService');
const { assertWithinSizeLimit } = require('../middleware/upload');
const { ALLOWED_UPLOAD_TYPES, MEDIA_KINDS } = require('../constants/media');
const { badRequest, notFound, HttpError } = require('../utils/httpError');

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;

function classify(mimeType) {
	const match = ALLOWED_UPLOAD_TYPES[mimeType];
	if (!match) {
		throw new HttpError(415, `Files of type ${mimeType} are not allowed.`);
	}

	return match;
}

function stripExtension(filename) {
	return String(filename || '').replace(/\.[^.]+$/, '');
}

/** Maps a Cloudinary upload result onto the MediaAsset shape. */
function toAssetFields(result, { kind, mimeType, originalFilename, uploadedBy }) {
	return {
		publicId: result.public_id,
		resourceType: result.resource_type,
		kind,
		url: result.secure_url || result.url || '',
		format: result.format || '',
		mimeType,
		bytes: result.bytes || 0,
		width: result.width || 0,
		height: result.height || 0,
		durationSeconds: result.duration || 0,
		pages: result.pages || 0,
		folder: result.folder || '',
		originalFilename,
		displayName: stripExtension(originalFilename),
		uploadedBy
	};
}

async function uploadFile(file, { uploadedBy = '' } = {}) {
	const { kind, resourceType } = classify(file.mimetype);
	assertWithinSizeLimit(file, kind);

	const result = await cloudinaryService.uploadBuffer(file.buffer, {
		kind,
		resourceType,
		filename: stripExtension(file.originalname)
	});

	return MediaAsset.create(toAssetFields(result, {
		kind,
		mimeType: file.mimetype,
		originalFilename: file.originalname || '',
		uploadedBy
	}));
}

async function uploadFiles(files, options) {
	const settled = await Promise.allSettled(files.map((file) => uploadFile(file, options)));

	return {
		assets: settled.filter((r) => r.status === 'fulfilled').map((r) => r.value),
		failures: settled
			.map((r, index) => ({ result: r, file: files[index] }))
			.filter(({ result }) => result.status === 'rejected')
			.map(({ result, file }) => ({
				filename: file.originalname || '',
				error: result.reason?.message || 'Upload failed.'
			}))
	};
}

function buildListQuery({ kind, search, tag, includeDeleted }) {
	const query = {};

	if (!includeDeleted) {
		query.deletedAt = null;
	}

	if (kind && MEDIA_KINDS.includes(kind)) {
		query.kind = kind;
	}

	if (tag) {
		query.tags = tag;
	}

	if (search) {
		// A regex rather than the text index, so partial words match while typing.
		const pattern = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
		query.$or = [
			{ displayName: pattern },
			{ originalFilename: pattern },
			{ alt: pattern },
			{ caption: pattern },
			{ publicId: pattern }
		];
	}

	return query;
}

async function listAssets({ kind, search, tag, page = 1, pageSize = DEFAULT_PAGE_SIZE, includeDeleted = false } = {}) {
	const safePage = Math.max(1, Number(page) || 1);
	const safePageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE));
	const query = buildListQuery({ kind, search, tag, includeDeleted });

	const [assets, total] = await Promise.all([
		MediaAsset.find(query).sort({ createdAt: -1 }).skip((safePage - 1) * safePageSize).limit(safePageSize),
		MediaAsset.countDocuments(query)
	]);

	return {
		assets,
		pagination: {
			page: safePage,
			pageSize: safePageSize,
			total,
			totalPages: Math.max(1, Math.ceil(total / safePageSize))
		}
	};
}

async function getAsset(id) {
	const asset = await MediaAsset.findById(id);
	if (!asset) {
		throw notFound('Media asset not found.');
	}

	return asset;
}

const EDITABLE_FIELDS = ['displayName', 'alt', 'caption'];

async function updateAsset(id, body) {
	const update = {};

	for (const field of EDITABLE_FIELDS) {
		if (body[field] !== undefined) {
			update[field] = String(body[field]).trim();
		}
	}

	if (Array.isArray(body.tags)) {
		update.tags = body.tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
	}

	if (Object.keys(update).length === 0) {
		throw badRequest('No editable fields were provided.');
	}

	const asset = await MediaAsset.findByIdAndUpdate(id, update, { new: true, runValidators: true });
	if (!asset) {
		throw notFound('Media asset not found.');
	}

	return asset;
}

/**
 * Removes the file from Cloudinary and soft-deletes the record, so a post that
 * still references it can explain what happened rather than showing a broken image.
 * Refuses assets that are still in use unless `force` is set.
 */
async function deleteAsset(id, { force = false } = {}) {
	const asset = await getAsset(id);

	if (asset.deletedAt) {
		return asset;
	}

	if (asset.usageCount > 0 && !force) {
		throw new HttpError(409, `That asset is used by ${asset.usageCount} post(s). Remove it from them first, or delete with force.`);
	}

	if (!cloudinaryService.isManagedPublicId(asset.publicId)) {
		throw badRequest('That asset is outside this project and cannot be deleted here.');
	}

	await cloudinaryService.destroy(asset.publicId, asset.resourceType);

	asset.deletedAt = new Date();
	await asset.save();

	return asset;
}

/**
 * Recomputes which blogs reference each asset. Called whenever a post is saved,
 * so `usageCount` reflects the current content rather than drifting over time.
 */
async function syncUsage(blogId, publicIds = []) {
	const unique = [...new Set(publicIds.filter(Boolean))];

	await MediaAsset.updateMany(
		{ usedInBlogs: blogId, publicId: { $nin: unique } },
		{ $pull: { usedInBlogs: blogId } }
	);

	if (unique.length > 0) {
		await MediaAsset.updateMany(
			{ publicId: { $in: unique }, usedInBlogs: { $ne: blogId } },
			{ $addToSet: { usedInBlogs: blogId } }
		);
	}

	// usageCount is derived from usedInBlogs so the two can never disagree.
	await MediaAsset.updateMany(
		{ $or: [{ usedInBlogs: blogId }, { publicId: { $in: unique } }] },
		[{ $set: { usageCount: { $size: '$usedInBlogs' } } }]
	);
}

async function releaseUsage(blogId) {
	await MediaAsset.updateMany({ usedInBlogs: blogId }, { $pull: { usedInBlogs: blogId } });
	await MediaAsset.updateMany({ usageCount: { $gt: 0 } }, [{ $set: { usageCount: { $size: '$usedInBlogs' } } }]);
}

module.exports = {
	uploadFile,
	uploadFiles,
	listAssets,
	getAsset,
	updateAsset,
	deleteAsset,
	syncUsage,
	releaseUsage,
	DEFAULT_PAGE_SIZE
};
