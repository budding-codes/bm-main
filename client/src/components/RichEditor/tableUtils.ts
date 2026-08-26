import type { Editor } from '@tiptap/react';

/**
 * Inserts a table from any block context (heading, list, blockquote, etc.)
 * by normalising the current block to a paragraph first.
 */
export function insertTableSafely(editor: Editor, rows: number, cols: number) {
  editor
    .chain()
    .focus()
    .clearNodes()
    .insertTable({ rows, cols, withHeaderRow: true })
    .run();
}
