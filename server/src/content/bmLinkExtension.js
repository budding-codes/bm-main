const Link = require('@tiptap/extension-link').Link || require('@tiptap/extension-link').default;
const { mergeAttributes } = require('@tiptap/core');
const { buildLinkHtmlAttributes, sanitizeLinkUrl } = require('../../../shared/content/linkUtils');

const BmLink = Link.extend({
	renderHTML({ HTMLAttributes }) {
		const href = typeof HTMLAttributes.href === 'string' ? HTMLAttributes.href : '';
		const linkAttrs = buildLinkHtmlAttributes(href);

		if (!linkAttrs) {
			return ['span', mergeAttributes(HTMLAttributes, { class: 'bm-content-link-invalid' }), 0];
		}

		return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, linkAttrs), 0];
	}
}).configure({
	openOnClick: false,
	autolink: true,
	defaultProtocol: 'https',
	protocols: ['http', 'https', 'mailto', 'tel'],
	HTMLAttributes: {
		class: 'bm-content-link'
	},
	isAllowedUri: (url, ctx) => sanitizeLinkUrl(url) !== null && ctx.defaultValidate(url),
	validate: (url) => sanitizeLinkUrl(url) !== null
});

module.exports = { BmLink };
