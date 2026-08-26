import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageNodeView } from '../ImageNodeView';
import {
  buildImageClassName,
  buildImageStyle,
  isImageAlignment,
  normalizeImageHeight,
  normalizeImageWidth,
  type ImageAlignment
} from '../imageUtils';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      setImageAlign: (align: ImageAlignment) => ReturnType;
      setImageSize: (size: { width: number; height?: number | null; aspectRatio?: number }) => ReturnType;
      replaceImage: (attrs: { src: string; alt?: string }) => ReturnType;
    };
  }

  interface Storage {
    image: {
      lockRatio: boolean;
    };
  }
}

function parseNumericAttr(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseAlign(element: Element): ImageAlignment | null {
  const direct = element.getAttribute('data-align');
  if (isImageAlignment(direct)) {
    return direct;
  }

  for (const className of element.classList) {
    if (className.startsWith('bm-content-image--align-')) {
      const align = className.replace('bm-content-image--align-', '');
      if (isImageAlignment(align)) {
        return align;
      }
    }
  }

  const parentAlign = element.parentElement?.getAttribute('data-align');
  return isImageAlignment(parentAlign) ? parentAlign : null;
}

export const BmImage = Image.extend({
  addStorage() {
    return {
      lockRatio: true
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const width =
            parseNumericAttr(element.getAttribute('width')) ||
            parseNumericAttr(element.style.width.replace('px', ''));
          return normalizeImageWidth(width);
        },
        renderHTML: (attributes) => {
          const width = normalizeImageWidth(attributes.width);
          if (!width) {
            return {};
          }
          return {
            width,
            style: buildImageStyle(width)
          };
        }
      },
      height: {
        default: null,
        parseHTML: (element) => parseNumericAttr(element.getAttribute('height')),
        renderHTML: (attributes) => {
          const height = normalizeImageWidth(attributes.height);
          if (!height) {
            return {};
          }
          return { height };
        }
      },
      align: {
        default: null,
        parseHTML: (element) => parseAlign(element),
        renderHTML: (attributes) => {
          if (!isImageAlignment(attributes.align)) {
            return {};
          }
          return {
            'data-align': attributes.align,
            class: `bm-content-image--align-${attributes.align}`
          };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure.bm-content-image-figure img[src]'
      },
      {
        tag: 'img[src]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLImageElement)) {
            return false;
          }
          return null;
        }
      }
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const align =
      (node && isImageAlignment(node.attrs.align) && node.attrs.align) ||
      (isImageAlignment(HTMLAttributes.align) && HTMLAttributes.align) ||
      (isImageAlignment(HTMLAttributes['data-align']) && HTMLAttributes['data-align']) ||
      null;
    const width = normalizeImageWidth(HTMLAttributes.width ?? node?.attrs?.width);
    const height = normalizeImageWidth(HTMLAttributes.height ?? node?.attrs?.height);
    const { align: _align, ...rest } = HTMLAttributes;

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, rest, {
        class: buildImageClassName(align),
        'data-align': align || undefined,
        width: width || undefined,
        height: height || undefined,
        style: buildImageStyle(width)
      })
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageAlign:
        (align) =>
        ({ chain }) =>
          chain().focus().updateAttributes(this.name, { align }).run(),
      setImageSize:
        ({ width, height, aspectRatio }) =>
        ({ chain }) => {
          const normalizedWidth = normalizeImageWidth(width);
          if (!normalizedWidth) {
            return false;
          }
          const normalizedHeight = normalizeImageHeight(height, normalizedWidth, aspectRatio || 1);
          return chain()
            .focus()
            .updateAttributes(this.name, {
              width: normalizedWidth,
              height: normalizedHeight
            })
            .run();
        },
      replaceImage:
        ({ src, alt }) =>
        ({ chain }) =>
          chain()
            .focus()
            .updateAttributes(this.name, {
              src,
              alt: alt ?? '',
              width: null,
              height: null
            })
            .run()
    };
  }
});
