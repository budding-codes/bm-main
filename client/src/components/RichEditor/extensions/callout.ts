import { Node, mergeAttributes } from '@tiptap/core';

export const CALLOUT_VARIANTS = ['info', 'tip', 'warning', 'danger'] as const;
export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

/**
 * Must stay in sync with server/src/content/calloutExtension.js.
 * The server rejects any document containing nodes it cannot render.
 */
export const Callout = Node.create({
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
          return CALLOUT_VARIANTS.includes(variant as CalloutVariant) ? variant : 'info';
        },
        renderHTML: (attributes) => ({ 'data-variant': attributes.variant || 'info' })
      }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'callout',
        class: 'bm-content-callout'
      }),
      0
    ];
  }
});
