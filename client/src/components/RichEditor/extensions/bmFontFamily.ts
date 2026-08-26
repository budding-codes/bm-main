import { Mark, mergeAttributes } from '@tiptap/core';
import { getFontCssClass, isValidFontId, normalizeFontId } from '../../../lib/fontRegistry';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontFamily: {
      setFontFamily: (fontId: string | null) => ReturnType;
      unsetFontFamily: () => ReturnType;
    };
  }
}

/**
 * Inline font-family mark using controlled registry IDs and CSS classes.
 * Must stay in sync with server/src/content/bmFontFamilyExtension.js.
 *
 * Self-exclusion is intentional: fontFamily must replace itself on switch.
 * Never disable mark self-exclusion — that stacks multiple fontFamily marks and
 * breaks switching after typing (toolbar reads the first/stale mark).
 */
export const BmFontFamily = Mark.create({
  name: 'fontFamily',
  inclusive: true,
  keepOnSplit: true,

  addAttributes() {
    return {
      fontId: {
        default: null,
        parseHTML: (element) => {
          const dataFont = element.getAttribute('data-font');
          if (isValidFontId(dataFont)) {
            return dataFont;
          }

          for (const className of element.classList) {
            if (className.startsWith('bm-font-')) {
              const id = className.slice('bm-font-'.length);
              if (isValidFontId(id)) {
                return id;
              }
            }
          }

          return null;
        },
        renderHTML: (attributes) => {
          const fontId = normalizeFontId(attributes.fontId);
          if (!fontId) {
            return {};
          }

          return {
            'data-font': fontId,
            class: getFontCssClass(fontId)
          };
        }
      }
    };
  },

  parseHTML() {
    return [
      { tag: 'span[data-font]' },
      { tag: 'span[class*="bm-font-"]' }
    ];
  },

  renderHTML({ mark, HTMLAttributes }) {
    const fontId = normalizeFontId(mark.attrs.fontId);
    if (!fontId) {
      return ['span', mergeAttributes(HTMLAttributes), 0];
    }

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-font': fontId,
        class: getFontCssClass(fontId)
      }),
      0
    ];
  },

  addCommands() {
    return {
      setFontFamily:
        (fontId) =>
        ({ commands, state, tr, dispatch }) => {
          if (fontId === null) {
            return commands.unsetMark(this.name);
          }

          const normalized = normalizeFontId(fontId);
          if (!normalized) {
            return false;
          }

          const type = state.schema.marks[this.name];
          if (!type) {
            return false;
          }

          const nextMark = type.create({ fontId: normalized });

          // Empty caret: set stored marks explicitly so the next keystrokes use the
          // new font instead of re-inheriting the previous inclusive fontFamily mark.
          // Mutate `tr` only — the chain runner dispatches once.
          if (state.selection.empty) {
            if (dispatch) {
              const base = tr.storedMarks || state.storedMarks || state.selection.$from.marks();
              const withoutFont = base.filter((mark) => mark.type !== type);
              tr.setStoredMarks([...withoutFont, nextMark]);
            }
            return true;
          }

          // Range selection: replace via setMark (self-excluding).
          return commands.setMark(this.name, { fontId: normalized });
        },
      unsetFontFamily:
        () =>
        ({ commands, state, tr, dispatch }) => {
          const type = state.schema.marks[this.name];
          if (!type) {
            return false;
          }

          if (state.selection.empty) {
            if (dispatch) {
              const base = tr.storedMarks || state.storedMarks || state.selection.$from.marks();
              tr.setStoredMarks(base.filter((mark) => mark.type !== type));
            }
            return true;
          }

          return commands.unsetMark(this.name);
        }
    };
  }
});
