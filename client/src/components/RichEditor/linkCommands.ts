import type { Editor } from '@tiptap/react';
import { sanitizeLinkUrl } from '../../lib/linkUtils';

export type SavedSelection = {
  from: number;
  to: number;
};

export function captureSelection(editor: Editor): SavedSelection {
  const { from, to } = editor.state.selection;
  return { from, to };
}

export function restoreSelection(editor: Editor, selection: SavedSelection): void {
  const docSize = editor.state.doc.content.size;
  const from = Math.max(0, Math.min(selection.from, docSize));
  const to = Math.max(from, Math.min(selection.to, docSize));
  editor.commands.setTextSelection({ from, to });
}

export function getActiveTextLinkHref(editor: Editor): string {
  if (!editor.isActive('link')) {
    return '';
  }
  const href = editor.getAttributes('link').href;
  return typeof href === 'string' ? href : '';
}

export function getActiveImageLinkHref(editor: Editor): string {
  if (!editor.isActive('image')) {
    return '';
  }
  const href = editor.getAttributes('image').href;
  return typeof href === 'string' ? href : '';
}

export function applyTextLink(editor: Editor, rawUrl: string, selection?: SavedSelection): boolean {
  const href = sanitizeLinkUrl(rawUrl);
  if (!href) {
    return false;
  }

  const chain = editor.chain().focus();
  if (selection) {
    chain.setTextSelection(selection);
  } else if (editor.isActive('link')) {
    chain.extendMarkRange('link');
  }

  return chain.setLink({ href }).run();
}

export function removeTextLink(editor: Editor, selection?: SavedSelection): boolean {
  const chain = editor.chain().focus();
  if (selection) {
    chain.setTextSelection(selection);
  } else {
    chain.extendMarkRange('link');
  }
  return chain.unsetLink().run();
}

export function applyImageLink(editor: Editor, rawUrl: string): boolean {
  const href = sanitizeLinkUrl(rawUrl);
  if (!href) {
    return false;
  }
  return editor.chain().focus().updateAttributes('image', { href }).run();
}

export function removeImageLink(editor: Editor): boolean {
  return editor.chain().focus().updateAttributes('image', { href: null }).run();
}

export function canApplyTextLink(editor: Editor): boolean {
  const { empty, from, to } = editor.state.selection;
  return !empty && from !== to;
}
