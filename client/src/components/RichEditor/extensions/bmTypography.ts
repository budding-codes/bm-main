import { Extension } from '@tiptap/core';

/**
 * Editor-only typography behaviour that does not change the stored document schema.
 * Keep this out of the server content extension list and createContentExtensions().
 */
export const BmTypography = Extension.create({
  name: 'bmTypography',

  // Run before StarterKit's default Enter so heading → body reset wins.
  priority: 1000,

  addKeyboardShortcuts() {
    return {
      // TipTap's TextAlign maps Mod-Shift-l to setTextAlign('left'), which writes a
      // redundant style. Prefer clearing the attribute so left matches the default HTML.
      'Mod-Shift-l': () => this.editor.commands.unsetTextAlign(),

      /**
       * Word/Docs behaviour: pressing Enter at the end of a heading starts a normal
       * (left-aligned) body paragraph instead of another heading that inherits center/right.
       */
      Enter: ({ editor }) => {
        const { $from, empty } = editor.state.selection;
        if (!empty) {
          return false;
        }
        if ($from.parent.type.name !== 'heading') {
          return false;
        }
        if ($from.parentOffset !== $from.parent.content.size) {
          return false;
        }

        return editor.chain().splitBlock().setParagraph().unsetTextAlign().run();
      }
    };
  }
});
