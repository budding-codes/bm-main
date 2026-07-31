const { v2: cloudinary } = require('cloudinary');
const env = require('../config/env');
const { MEDIA_ROOT_FOLDER } = require('../constants/media');
const { HttpError } = require('../utils/httpError');

if (env.cloudinary.isConfigured) {
	cloudinary.config({
		cloud_name: env.cloudinary.cloudName,
		api_key: env.cloudinary.apiKey,
		api_secret: env.cloudinary.apiSecret,
		secure: true
	});
} else {
	console.warn('[media] Cloudinary is not configured. Upload endpoints will return 503.');
}

function assertConfigured() {
	if (!env.cloudinary.isConfigured) {
		throw new HttpError(503, 'Media uploads are not configured on this server.');
	}
}

function folderFor(kind) {
	return `${MEDIA_ROOT_FOLDER}/${kind}s`;
}

/**
 * Streams a buffer to Cloudinary.
 *
 * No quality or format transformation is applied here. Those are delivery-time
 * concerns: the original is stored once, and `buildDeliveryUrl` derives optimised
 * variants per request. Baking them in at upload would fix a single rendition.
 */
function uploadBuffer(buffer, { kind, resourceType, filename }) {
	assertConfigured();

	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{
				folder: folderFor(kind),
				resource_type: resourceType,
				use_filename: Boolean(filename),
				filename_override: filename,
				unique_filename: true,
				overwrite: false
			},
			(error, result) => (error ? reject(error) : resolve(result))
		);

		stream.end(buffer);
	});
}

function destroy(publicId, resourceType = 'image') {
	assertConfigured();

	return cloudinary.uploader.destroy(publicId, {
		resource_type: resourceType,
		invalidate: true
	});
}

/** Rejects any public ID outside this project's folder. */
function isManagedPublicId(publicId) {
	return typeof publicId === 'string' && publicId.startsWith(`${MEDIA_ROOT_FOLDER}/`);
}

module.exports = {
	cloudinary,
	assertConfigured,
	uploadBuffer,
	destroy,
	folderFor,
	isManagedPublicId,
	isConfigured: () => env.cloudinary.isConfigured
};
