import type { Editor } from '@tiptap/react';
import {
  FONT_REGISTRY,
  buildEditorPreviewFontsUrl,
  getFontById
} from '../../lib/fontRegistry';

const EDITOR_FONTS_LINK_ID = 'bm-editor-font-preview';

/** Keep editor focus/selection when interacting with toolbar controls. */
export function preventEditorToolbarMouseDown(event: React.MouseEvent) {
  event.preventDefault();
}

/**
 * Loads all registry Google Fonts for the editor canvas + font selector.
 * Must run on editor mount — not only when the dropdown opens — so typed
 * text renders with the real face immediately after selection.
 */
export function ensureEditorPreviewFontsLoaded() {
  if (typeof document === 'undefined') {
    return;
  }

  const href = buildEditorPreviewFontsUrl();
  if (!href) {
    return;
  }

  const existing = document.getElementById(EDITOR_FONTS_LINK_ID) as HTMLLinkElement | null;
  if (existing) {
    if (existing.getAttribute('href') !== href) {
      existing.href = href;
    }
    return;
  }

  const link = document.createElement('link');
  link.id = EDITOR_FONTS_LINK_ID;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export type SelectionFontState = string | null | 'mixed';

function fontIdFromMarks(marks: readonly { type: { name: string }; attrs: Record<string, unknown> }[]) {
  // Prefer the last fontFamily mark so legacy stacked marks (from excludes:'')
  // resolve to the most recently applied font.
  let fontId: string | null = null;
  for (const mark of marks) {
    if (mark.type.name === 'fontFamily') {
      fontId = (mark.attrs.fontId as string | undefined) || null;
    }
  }
  return fontId;
}

export function getSelectionFontId(editor: Editor): SelectionFontState {
  const { from, to, empty } = editor.state.selection;

  if (empty) {
    // TipTap getAttributes prefers storedMarks (pending typing mark) over the
    // adjacent inclusive mark — critical after switching fonts at a caret.
    const active = editor.getAttributes('fontFamily').fontId as string | null | undefined;
    if (active) {
      return active;
    }

    // Fallback for legacy stacked marks: resolve to the latest fontFamily.
    return fontIdFromMarks(editor.state.selection.$from.marks());
  }

  let found: string | null | undefined;
  editor.state.doc.nodesBetween(from, to, (node) => {
    if (!node.isText) {
      return;
    }

    const fontId = fontIdFromMarks(node.marks);

    if (found === undefined) {
      found = fontId;
      return;
    }

    if (found !== fontId) {
      found = 'mixed';
      return false;
    }
  });

  return found === undefined ? null : found;
}

export function getFontSelectorLabel(fontId: SelectionFontState): string {
  if (fontId === 'mixed') {
    return 'Mixed fonts';
  }

  if (!fontId) {
    return 'Default';
  }

  return getFontById(fontId)?.label || 'Default';
}

export function applyFontFamily(editor: Editor, fontId: string | null): boolean {
  if (!editor || editor.isDestroyed) {
    return false;
  }

  // Ensure web fonts are available before the mark paints in the canvas.
  ensureEditorPreviewFontsLoaded();

  const { from, to, empty } = editor.state.selection;
  const chain = editor.chain().focus();

  if (!empty) {
    // Re-assert the range in case the view blurred before the command ran.
    chain.setTextSelection({ from, to });
  }

  if (fontId === null) {
    return chain.unsetFontFamily().run();
  }

  return chain.setFontFamily(fontId).run();
}

export function canSetFontFamily(editor: Editor): boolean {
  const probeId = FONT_REGISTRY[0]?.id;
  return Boolean(probeId && editor.can().setFontFamily(probeId));
}
