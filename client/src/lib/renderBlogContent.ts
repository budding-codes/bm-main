import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string';
import { createContentExtensions } from '../components/RichEditor/extensions';
import { normalizeDocumentFonts } from './fontRegistry';

const contentExtensions = createContentExtensions();

/**
 * Renders stored Tiptap JSON into article HTML using the same schema and
 * `renderHTML` rules as the server (`server/src/content/renderer.js`).
 */
export function renderBlogContentHtml(content: Record<string, unknown> | null | undefined): string {
  if (!content || !Array.isArray((content as { content?: unknown }).content)) {
    return '';
  }

  try {
    const normalized = normalizeDocumentFonts(content) as Record<string, unknown>;
    return renderToHTMLString({
      extensions: contentExtensions,
      content: normalized
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[renderBlogContentHtml] Failed to render preview HTML.', error);
    }
    return '';
  }
}

/** Normalises font marks before content is sent to the API or stored locally. */
export function prepareContentBlocksForSave(
  content: Record<string, unknown> | null | undefined
): Record<string, unknown> | null {
  if (!content || !Array.isArray((content as { content?: unknown }).content)) {
    return null;
  }

  return normalizeDocumentFonts(content) as Record<string, unknown>;
}
