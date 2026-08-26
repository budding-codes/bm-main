import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string';
import { createContentExtensions } from '../components/RichEditor/extensions';

const contentExtensions = createContentExtensions();

/**
 * Renders stored Tiptap JSON into article HTML using the same schema and
 * `renderHTML` rules as the server (`server/src/content/renderer.js`).
 */
export function renderBlogContentHtml(content: Record<string, unknown> | null | undefined): string {
  if (!content || !Array.isArray((content as { content?: unknown }).content)) {
    return '';
  }

  return renderToHTMLString({
    extensions: contentExtensions,
    content
  });
}
