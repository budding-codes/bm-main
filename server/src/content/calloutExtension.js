const { Node, mergeAttributes } = require('@tiptap/core');

const CALLOUT_VARIANTS = ['info', 'tip', 'warning', 'danger'];

/**
 * A block that wraps its children in a coloured panel, used for admission notices
 * and advisories. Defined here rather than in the client so the server can render
 * it; the client imports the same shape.
 */
const Callout = Node.create({
	name: 'callout',
	group: 'block',
	content: 'block+',
	defining: true,

	addAttributes() {
		return {
			variant: {
				default: 'info',
				parseHTML: (element) => {
					const variant = element.getAttribute('data-variant');
					return CALLOUT_VARIANTS.includes(variant) ? variant : 'info';
				},
				renderHTML: (attributes) => ({ 'data-variant': attributes.variant || 'info' })
			}
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-type="callout"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return ['div', mergeAttributes(HTMLAttributes, {
			'data-type': 'callout',
			class: 'bm-content-callout'
		}), 0];
	}
});

module.exports = { Callout, CALLOUT_VARIANTS };
