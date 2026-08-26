const { sanitizeLinkUrl } = require('../../../shared/content/linkUtils');

function isPlainObject(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeMarks(marks) {
	if (!Array.isArray(marks)) {
		return marks;
	}

	return marks
		.map((mark) => {
			if (!isPlainObject(mark) || mark.type !== 'link' || !isPlainObject(mark.attrs)) {
				return mark;
			}

			const href = sanitizeLinkUrl(mark.attrs.href);
			if (!href) {
				return null;
			}

			return {
				...mark,
				attrs: {
					...mark.attrs,
					href
				}
			};
		})
		.filter(Boolean);
}

function sanitizeNode(node) {
	if (!isPlainObject(node)) {
		return node;
	}

	let next = node;

	if (node.type === 'image' && isPlainObject(node.attrs) && node.attrs.href) {
		const href = sanitizeLinkUrl(node.attrs.href);
		next = {
			...node,
			attrs: {
				...node.attrs,
				href: href || null
			}
		};
	}

	if (Array.isArray(node.marks)) {
		const marks = sanitizeMarks(node.marks);
		next = marks.length > 0 ? { ...next, marks } : { ...next, marks: undefined };
		if (!next.marks) {
			const { marks: _removed, ...withoutMarks } = next;
			next = withoutMarks;
		}
	}

	if (Array.isArray(node.content)) {
		next = {
			...next,
			content: node.content.map((child) => sanitizeNode(child))
		};
	}

	return next;
}

function normalizeDocumentLinks(doc) {
	if (!isPlainObject(doc) || doc.type !== 'doc') {
		return doc;
	}

	return sanitizeNode(doc);
}

module.exports = { normalizeDocumentLinks };
