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

module.exports = { extractYouTubeVideoId, resolveThumbnailUrl };
