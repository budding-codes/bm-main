const { READING_WORDS_PER_MINUTE, EXCERPT_MAX } = require('../constants/blog');

const BLOCK_LEVEL_TAGS = /<\/?(p|div|br|li|h[1-6]|blockquote|tr|pre|figcaption)\b[^>]*>/gi;

/**
 * Converts HTML to readable plain text. Block-level tags become spaces so that
 * `<p>one</p><p>two</p>` does not collapse into `onetwo`.
 */
function htmlToText(html) {
	if (!html) {
		return '';
	}

	return String(html)
		.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
		.replace(BLOCK_LEVEL_TAGS, ' ')
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/\s+/g, ' ')
		.trim();
}

function countWords(text) {
	const trimmed = String(text || '').trim();
	if (!trimmed) {
		return 0;
	}

	return trimmed.split(/\s+/).length;
}

function estimateReadingTime(wordCount) {
	if (!wordCount) {
		return 0;
	}

	return Math.max(1, Math.ceil(wordCount / READING_WORDS_PER_MINUTE));
}

/** Truncates on a word boundary so an excerpt never ends mid-word. */
function buildExcerpt(text, maxLength = EXCERPT_MAX) {
	const normalized = String(text || '').replace(/\s+/g, ' ').trim();
	if (normalized.length <= maxLength) {
		return normalized;
	}

	const clipped = normalized.slice(0, maxLength);
	const lastSpace = clipped.lastIndexOf(' ');

	return `${(lastSpace > maxLength * 0.6 ? clipped.slice(0, lastSpace) : clipped).trim()}…`;
}

module.exports = { htmlToText, countWords, estimateReadingTime, buildExcerpt };
