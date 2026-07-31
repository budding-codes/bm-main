const multer = require('multer');
const {
	ALLOWED_UPLOAD_TYPES,
	MAX_UPLOAD_BYTES,
	MAX_UPLOAD_BYTES_ANY,
	MAX_FILES_PER_REQUEST
} = require('../constants/media');
const { HttpError } = require('../utils/httpError');

/**
 * Files are held in memory and streamed straight to Cloudinary, so nothing is
 * written to the server's disk.
 *
 * Multer can only enforce one size limit, so it is set to the largest allowed
 * value and the per-kind limit is checked afterwards by `assertWithinSizeLimit`.
 */
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: MAX_UPLOAD_BYTES_ANY,
		files: MAX_FILES_PER_REQUEST
	},
	fileFilter(req, file, cb) {
		if (ALLOWED_UPLOAD_TYPES[file.mimetype]) {
			return cb(null, true);
		}

		cb(new HttpError(415, `Files of type ${file.mimetype} are not allowed.`));
	}
});

function assertWithinSizeLimit(file, kind) {
	const limit = MAX_UPLOAD_BYTES[kind];

	if (limit && file.size > limit) {
		const limitMb = Math.round(limit / (1024 * 1024));
		throw new HttpError(413, `${kind} uploads are limited to ${limitMb}MB.`);
	}
}

/** Translates multer's own errors into the app's JSON error shape. */
function handleUploadErrors(err, req, res, next) {
	if (err instanceof multer.MulterError) {
		if (err.code === 'LIMIT_FILE_SIZE') {
			return next(new HttpError(413, 'That file is too large.'));
		}
		if (err.code === 'LIMIT_FILE_COUNT') {
			return next(new HttpError(400, `A maximum of ${MAX_FILES_PER_REQUEST} files can be uploaded at once.`));
		}
		return next(new HttpError(400, 'That upload could not be read.'));
	}

	next(err);
}

module.exports = { upload, assertWithinSizeLimit, handleUploadErrors };
