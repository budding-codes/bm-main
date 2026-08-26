import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageNodeView } from '../ImageNodeView';
import {
  buildFigureClassName,
  buildImageClassName,
  buildImageStyle,
  isImageAlignment,
  isImageLayout,
  isImageSpacing,
  normalizeImageAttrs,
  normalizeImageHeight,
  normalizeImageWidth,
  resolveLayoutDimensions,
  shouldRenderFigure,
  type ImageAlignment,
  type ImageLayout,
  type ImageSpacing
} from '../imageUtils';
import { buildLinkHtmlAttributes } from '../../../lib/linkUtils';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      setImageAlign: (align: ImageAlignment) => ReturnType;
      setImageLayout: (layout: ImageLayout) => ReturnType;
      setImageSpacing: (spacing: ImageSpacing) => ReturnType;
      setImageSize: (size: {
        width?: number | null;
        height?: number | null;
        aspectRatio?: number;
        layout?: ImageLayout;
      }) => ReturnType;
      setImageLink: (href: string | null) => ReturnType;
      replaceImage: (attrs: { src: string; alt?: string; preserveConfig?: boolean }) => ReturnType;
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
    if (className.startsWith('bm-content-image-figure--align-')) {
      const align = className.replace('bm-content-image-figure--align-', '');
      if (isImageAlignment(align)) {
        return align;
      }
    }
  }

  const parentAlign = element.parentElement?.getAttribute('data-align');
  return isImageAlignment(parentAlign) ? parentAlign : null;
}

function parseLayout(element: Element): ImageLayout | null {
  const direct = element.getAttribute('data-layout');
  if (isImageLayout(direct)) {
    return direct;
  }

  for (const className of element.classList) {
    if (className.startsWith('bm-content-image-figure--layout-')) {
      const layout = className.replace('bm-content-image-figure--layout-', '');
      if (isImageLayout(layout)) {
        return layout;
      }
    }
  }

  const parentLayout = element.parentElement?.getAttribute('data-layout');
  return isImageLayout(parentLayout) ? parentLayout : null;
}

function parseSpacing(element: Element): ImageSpacing | null {
  const direct = element.getAttribute('data-spacing');
  if (isImageSpacing(direct)) {
    return direct;
  }

  for (const className of element.classList) {
    if (className.startsWith('bm-content-image-figure--spacing-')) {
      const spacing = className.replace('bm-content-image-figure--spacing-', '');
      if (isImageSpacing(spacing)) {
        return spacing;
      }
    }
  }

  const parentSpacing = element.parentElement?.getAttribute('data-spacing');
  return isImageSpacing(parentSpacing) ? parentSpacing : null;
}

function parseCaption(element: Element): string {
  const figure = element.closest('figure.bm-content-image-figure');
  const caption = figure?.querySelector('figcaption.bm-content-image-caption');
  return caption?.textContent?.trim() || '';
}

function parseImageHref(element: Element): string | null {
  const anchor = element.closest('a');
  const href = anchor?.getAttribute('href');
  return href || null;
}

function wrapImageContent(
  imgNode: ['img', Record<string, unknown>],
  href: string | null | undefined
): ['img', Record<string, unknown>] | ['a', Record<string, unknown>, ['img', Record<string, unknown>]] {
  const linkAttrs = href ? buildLinkHtmlAttributes(href) : null;
  if (!linkAttrs) {
    return imgNode;
  }
  return ['a', linkAttrs, imgNode];
}

function buildImageHtmlAttributes(attrs: ReturnType<typeof normalizeImageAttrs>) {
  return {
    class: buildImageClassName(attrs.align),
    'data-align': attrs.align || undefined,
    src: attrs.src || undefined,
    alt: attrs.alt,
    width: attrs.width || undefined,
    height: attrs.height || undefined,
    style: buildImageStyle(attrs.width, attrs.layout)
  };
}

function buildFigureHtmlAttributes(attrs: ReturnType<typeof normalizeImageAttrs>) {
  return {
    class: buildFigureClassName(attrs),
    'data-layout': attrs.layout,
    'data-align': attrs.align || undefined,
    'data-spacing': attrs.spacing
  };
}

export const BmImage = Image.extend({
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
        renderHTML: () => ({})
      },
      height: {
        default: null,
        parseHTML: (element) => parseNumericAttr(element.getAttribute('height')),
        renderHTML: () => ({})
      },
      align: {
        default: null,
        parseHTML: (element) => parseAlign(element),
        renderHTML: () => ({})
      },
      layout: {
        default: 'inline',
        parseHTML: (element) => parseLayout(element) || 'inline',
        renderHTML: () => ({})
      },
      caption: {
        default: '',
        parseHTML: (element) => parseCaption(element),
        renderHTML: () => ({})
      },
      spacing: {
        default: 'medium',
        parseHTML: (element) => parseSpacing(element) || 'medium',
        renderHTML: () => ({})
      },
      lockAspectRatio: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-lock-aspect') !== 'false',
        renderHTML: () => ({})
      },
      href: {
        default: null,
        parseHTML: (element) => parseImageHref(element),
        renderHTML: () => ({})
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure.bm-content-image-figure img[src]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLImageElement)) {
            return false;
          }
          return null;
        }
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
    const normalized = normalizeImageAttrs({
      ...node?.attrs,
      ...HTMLAttributes
    });
    const imgAttrs = mergeAttributes(this.options.HTMLAttributes, buildImageHtmlAttributes(normalized));
    const imgNode = ['img', imgAttrs] as ['img', Record<string, unknown>];
    const linkedImg = wrapImageContent(imgNode, normalized.href);

    if (!shouldRenderFigure(normalized)) {
      return linkedImg;
    }

    const figureChildren: Array<string | Record<string, unknown> | unknown[]> = [linkedImg];
    if (normalized.caption) {
      figureChildren.push(['figcaption', { class: 'bm-content-image-caption' }, normalized.caption]);
    }

    return ['figure', buildFigureHtmlAttributes(normalized), ...figureChildren];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageAlign:
        (align) =>
        ({ chain, editor }) => {
          const current = normalizeImageAttrs(editor.getAttributes(this.name));
          const next = normalizeImageAttrs({ ...current, align, layout: current.layout });
          return chain().focus().updateAttributes(this.name, { align: next.align }).run();
        },
      setImageLayout:
        (layout) =>
        ({ chain, editor }) => {
          const current = normalizeImageAttrs(editor.getAttributes(this.name));

          let naturalWidth: number | null = null;
          let naturalHeight: number | null = null;
          const { from } = editor.state.selection;
          const dom = editor.view.nodeDOM(from);
          if (dom instanceof HTMLElement) {
            const img = dom.matches('img') ? dom : dom.querySelector('img');
            if (img instanceof HTMLImageElement) {
              naturalWidth = img.naturalWidth || null;
              naturalHeight = img.naturalHeight || null;
            }
          }

          const dimensions = resolveLayoutDimensions(
            { ...current, layout },
            naturalWidth,
            naturalHeight
          );
          const next = normalizeImageAttrs({ ...current, layout, ...dimensions });
          return chain()
            .focus()
            .updateAttributes(this.name, {
              layout: next.layout,
              align: next.align,
              width: next.width,
              height: next.height
            })
            .run();
        },
      setImageSpacing:
        (spacing) =>
        ({ chain }) =>
          chain().focus().updateAttributes(this.name, { spacing }).run(),
      setImageSize:
        ({ width, height, aspectRatio, layout }) =>
        ({ chain, editor }) => {
          const current = normalizeImageAttrs(editor.getAttributes(this.name));
          const nextLayout = layout || current.layout;
          const normalizedWidth = nextLayout === 'full-width' ? null : normalizeImageWidth(width);
          if (nextLayout !== 'full-width' && !normalizedWidth) {
            return false;
          }

          const lockRatio = current.lockAspectRatio;
          const ratio = aspectRatio || 1;
          const normalizedHeight =
            nextLayout === 'full-width'
              ? null
              : lockRatio
                ? normalizeImageHeight(null, normalizedWidth as number, ratio)
                : normalizeImageHeight(height, normalizedWidth as number, ratio);

          const next = normalizeImageAttrs({
            ...current,
            layout: nextLayout,
            width: normalizedWidth,
            height: normalizedHeight
          });

          return chain()
            .focus()
            .updateAttributes(this.name, {
              layout: next.layout,
              align: next.align,
              width: next.width,
              height: next.height
            })
            .run();
        },
      setImageLink:
        (href) =>
        ({ chain }) =>
          chain().focus().updateAttributes(this.name, { href: href || null }).run(),
      replaceImage:
        ({ src, alt, preserveConfig = true }) =>
        ({ chain, editor }) => {
          const current = normalizeImageAttrs(editor.getAttributes(this.name));
          const nextAlt = preserveConfig && current.alt ? current.alt : (alt ?? '');

          if (preserveConfig) {
            return chain()
              .focus()
              .updateAttributes(this.name, {
                src,
                alt: nextAlt
              })
              .run();
          }

          return chain()
            .focus()
            .updateAttributes(this.name, {
              src,
              alt: alt ?? '',
              width: null,
              height: null,
              align: null,
              layout: 'inline',
              caption: '',
              spacing: 'medium',
              lockAspectRatio: true
            })
            .run();
        }
    };
  }
});
