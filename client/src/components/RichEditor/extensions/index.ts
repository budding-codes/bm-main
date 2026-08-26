import StarterKit from '@tiptap/starter-kit';
import Youtube from '@tiptap/extension-youtube';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { Callout } from './callout';
import { BmImage } from './bmImage';
import { BmTypography } from './bmTypography';

/**
 * Document schema shared with the server renderer.
 * Keep shared extensions identical to server/src/content/extensions.js.
 * Placeholder, CharacterCount, and BmTypography are editor-only and do not
 * affect stored JSON or server HTML.
 */
const EDITOR_ONLY_EXTENSION_NAMES = new Set(['placeholder', 'characterCount', 'bmTypography']);

/** Schema used for static HTML rendering (preview + parity with the server). */
export function createContentExtensions(placeholder?: string) {
  return createEditorExtensions(placeholder).filter(
    (extension) => !EDITOR_ONLY_EXTENSION_NAMES.has(extension.name)
  );
}

export function createEditorExtensions(placeholder?: string) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      link: {
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'bm-content-link',
          rel: 'noopener noreferrer nofollow',
          target: '_blank'
        }
      },
      codeBlock: { HTMLAttributes: { class: 'bm-content-code-block' } }
    }),
    BmImage.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: { class: 'bm-content-image', loading: 'lazy', decoding: 'async' }
    }),
    Youtube.configure({
      nocookie: true,
      HTMLAttributes: { class: 'bm-content-embed' }
    }),
    Highlight.configure({ multicolor: false }),
    TextAlign.configure({
      types: ['heading', 'paragraph', 'listItem'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: null
    }),
    Subscript,
    Superscript,
    Table.configure({
      resizable: true,
      renderWrapper: true,
      HTMLAttributes: { class: 'bm-content-table' }
    }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList.configure({ HTMLAttributes: { class: 'bm-content-task-list' } }),
    TaskItem.configure({ nested: true }),
    Callout,
    BmTypography,
    Placeholder.configure({
      placeholder: placeholder || 'Start writing… Type / for blocks',
      emptyEditorClass: 'bm-editor-empty'
    }),
    CharacterCount
  ];
}
