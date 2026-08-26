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

/**
 * Document schema shared with the server renderer.
 * Keep this list identical to server/src/content/extensions.js.
 * Placeholder and CharacterCount are editor-only and do not affect stored JSON.
 */
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
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
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
    Placeholder.configure({
      placeholder: placeholder || 'Start writing… Type / for blocks',
      emptyEditorClass: 'bm-editor-empty'
    }),
    CharacterCount
  ];
}
