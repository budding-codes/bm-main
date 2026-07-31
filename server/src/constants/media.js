const MEDIA_KIND = {
	IMAGE: 'image',
	VIDEO: 'video',
	AUDIO: 'audio',
	DOCUMENT: 'document',
	OTHER: 'other'
};

const MEDIA_KINDS = Object.values(MEDIA_KIND);
const MEDIA_RESOURCE_TYPES = ['image', 'video', 'raw'];

const MEDIA_ROOT_FOLDER = 'bm-blog';

/**
 * Accepted upload types, mapped to the library category and the Cloudinary
 * resource type used to store them. Cloudinary handles audio under `video`.
 */
const ALLOWED_UPLOAD_TYPES = {
	'image/jpeg': { kind: MEDIA_KIND.IMAGE, resourceType: 'image' },
	'image/png': { kind: MEDIA_KIND.IMAGE, resourceType: 'image' },
	'image/gif': { kind: MEDIA_KIND.IMAGE, resourceType: 'image' },
	'image/webp': { kind: MEDIA_KIND.IMAGE, resourceType: 'image' },
	'image/avif': { kind: MEDIA_KIND.IMAGE, resourceType: 'image' },
	'image/svg+xml': { kind: MEDIA_KIND.IMAGE, resourceType: 'image' },

	'video/mp4': { kind: MEDIA_KIND.VIDEO, resourceType: 'video' },
	'video/webm': { kind: MEDIA_KIND.VIDEO, resourceType: 'video' },
	'video/quicktime': { kind: MEDIA_KIND.VIDEO, resourceType: 'video' },

	'audio/mpeg': { kind: MEDIA_KIND.AUDIO, resourceType: 'video' },
	'audio/mp4': { kind: MEDIA_KIND.AUDIO, resourceType: 'video' },
	'audio/wav': { kind: MEDIA_KIND.AUDIO, resourceType: 'video' },
	'audio/webm': { kind: MEDIA_KIND.AUDIO, resourceType: 'video' },

	'application/pdf': { kind: MEDIA_KIND.DOCUMENT, resourceType: 'raw' },
	'application/msword': { kind: MEDIA_KIND.DOCUMENT, resourceType: 'raw' },
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { kind: MEDIA_KIND.DOCUMENT, resourceType: 'raw' },
	'application/vnd.ms-excel': { kind: MEDIA_KIND.DOCUMENT, resourceType: 'raw' },
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { kind: MEDIA_KIND.DOCUMENT, resourceType: 'raw' }
};

/** Per-file upload ceilings, by library category. */
const MAX_UPLOAD_BYTES = {
	[MEDIA_KIND.IMAGE]: 15 * 1024 * 1024,
	[MEDIA_KIND.VIDEO]: 100 * 1024 * 1024,
	[MEDIA_KIND.AUDIO]: 30 * 1024 * 1024,
	[MEDIA_KIND.DOCUMENT]: 25 * 1024 * 1024,
	[MEDIA_KIND.OTHER]: 10 * 1024 * 1024
};

const MAX_UPLOAD_BYTES_ANY = Math.max(...Object.values(MAX_UPLOAD_BYTES));
const MAX_FILES_PER_REQUEST = 10;

module.exports = {
	MEDIA_KIND,
	MEDIA_KINDS,
	MEDIA_RESOURCE_TYPES,
	MEDIA_ROOT_FOLDER,
	ALLOWED_UPLOAD_TYPES,
	MAX_UPLOAD_BYTES,
	MAX_UPLOAD_BYTES_ANY,
	MAX_FILES_PER_REQUEST
};
