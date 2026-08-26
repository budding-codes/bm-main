import type { Editor } from '@tiptap/react';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from 'lucide-react';

export const TEXT_ALIGNS = ['left', 'center', 'right', 'justify'] as const;
export type TextAlignValue = (typeof TEXT_ALIGNS)[number];
export type SelectionTextAlign = TextAlignValue | 'mixed' | null;

const ALIGNABLE_TYPES = new Set(['paragraph', 'heading', 'listItem']);

const ALIGN_SHORTCUTS: Record<TextAlignValue, string> = {
  left: 'Ctrl+Shift+L',
  center: 'Ctrl+Shift+E',
  right: 'Ctrl+Shift+R',
  justify: 'Ctrl+Shift+J'
};

const ALIGN_LABELS: Record<TextAlignValue, string> = {
  left: 'Align left',
  center: 'Align center',
  right: 'Align right',
  justify: 'Justify'
};

export const TEXT_ALIGN_ICONS = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  justify: AlignJustify
} as const;

export const EMPTY_ALIGN_TOOLBAR_STATE = {
  selectionAlign: null as SelectionTextAlign,
  isHeading: false,
  canLeft: false,
  canCenter: false,
  canRight: false,
  canJustify: false
};

function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /Mac|iPhone|iPad/.test(navigator.platform);
}

function isUsableEditor(editor: Editor | null | undefined): editor is Editor {
  if (!editor) {
    return false;
  }
  try {
    return !editor.isDestroyed && Boolean(editor.view);
  } catch {
    return false;
  }
}

export function isTextAlignValue(value: unknown): value is TextAlignValue {
  return typeof value === 'string' && (TEXT_ALIGNS as readonly string[]).includes(value);
}

/** Normalize TipTap's null default to left for UI state. */
export function normalizeTextAlign(value: unknown): TextAlignValue {
  if (value === 'center' || value === 'right' || value === 'justify' || value === 'left') {
    return value;
  }
  return 'left';
}

/**
 * Inspects alignable blocks in the selection.
 * - null: nothing alignable (e.g. image / hr selected) or editor unavailable
 * - mixed: multiple different alignments in the selection
 * - otherwise the single shared alignment (left includes unset/default)
 */
export function getSelectionTextAlign(editor: Editor | null | undefined): SelectionTextAlign {
  if (!isUsableEditor(editor)) {
    return null;
  }

  const found = new Set<TextAlignValue>();
  const { from, to } = editor.state.selection;

  editor.state.doc.nodesBetween(from, to, (node) => {
    if (!ALIGNABLE_TYPES.has(node.type.name)) {
      return;
    }
    // Prefer the leaf text block when both listItem and its paragraph are visited.
    if (node.type.name === 'listItem') {
      return;
    }
    found.add(normalizeTextAlign(node.attrs.textAlign));
  });

  if (found.size === 0) {
    if (editor.isActive('heading')) {
      return normalizeTextAlign(editor.getAttributes('heading').textAlign);
    }
    if (editor.isActive('paragraph')) {
      return normalizeTextAlign(editor.getAttributes('paragraph').textAlign);
    }
    if (editor.isActive('listItem')) {
      return normalizeTextAlign(editor.getAttributes('listItem').textAlign);
    }
    return null;
  }

  if (found.size > 1) {
    return 'mixed';
  }

  return [...found][0];
}

export function canSetTextAlign(
  editor: Editor | null | undefined,
  value: TextAlignValue = 'left'
): boolean {
  if (!isUsableEditor(editor)) {
    return false;
  }

  if (value === 'justify' && editor.isActive('heading')) {
    return false;
  }

  try {
    if (value === 'left') {
      return editor.can().unsetTextAlign() || editor.can().setTextAlign('left');
    }
    return editor.can().setTextAlign(value);
  } catch {
    // TipTap can throw while the view is tearing down mid-transaction.
    return false;
  }
}

/** Left clears the attribute so published HTML stays free of redundant styles. */
export function applyTextAlign(editor: Editor | null | undefined, value: TextAlignValue): void {
  if (!isUsableEditor(editor)) {
    return;
  }

  if (value === 'justify' && editor.isActive('heading')) {
    return;
  }

  if (value === 'left') {
    editor.chain().focus().unsetTextAlign().run();
    return;
  }

  editor.chain().focus().setTextAlign(value).run();
}

export function getAlignToolbarState(editor: Editor | null | undefined) {
  if (!isUsableEditor(editor)) {
    return EMPTY_ALIGN_TOOLBAR_STATE;
  }

  return {
    selectionAlign: getSelectionTextAlign(editor),
    isHeading: editor.isActive('heading'),
    canLeft: canSetTextAlign(editor, 'left'),
    canCenter: canSetTextAlign(editor, 'center'),
    canRight: canSetTextAlign(editor, 'right'),
    canJustify: canSetTextAlign(editor, 'justify')
  };
}

export function alignButtonTitle(value: TextAlignValue, options?: { disabledReason?: string }): string {
  if (options?.disabledReason) {
    return options.disabledReason;
  }
  const chord = ALIGN_SHORTCUTS[value].replace('Ctrl', isMacPlatform() ? '⌘' : 'Ctrl');
  return `${ALIGN_LABELS[value]} (${chord})`;
}

export function alignButtonLabel(value: TextAlignValue): string {
  return ALIGN_LABELS[value];
}
