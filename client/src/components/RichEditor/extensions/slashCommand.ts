import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion, { type SuggestionProps } from '@tiptap/suggestion';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import { SlashCommandMenu, type SlashCommandItem, type SlashCommandMenuHandle } from '../SlashCommandMenu';

function buildCommands(): SlashCommandItem[] {
  return [
    {
      title: 'Paragraph',
      description: 'Plain body text',
      icon: '¶',
      group: 'Text',
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run()
    },
    {
      title: 'Heading 1',
      description: 'Large section title',
      icon: 'H1',
      group: 'Text',
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
    },
    {
      title: 'Heading 2',
      description: 'Medium section title',
      icon: 'H2',
      group: 'Text',
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
    },
    {
      title: 'Heading 3',
      description: 'Small section title',
      icon: 'H3',
      group: 'Text',
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
    },
    {
      title: 'Bullet List',
      description: 'Unordered list',
      icon: '•',
      group: 'Text',
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
    {
      title: 'Ordered List',
      description: 'Numbered list',
      icon: '1.',
      group: 'Text',
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
    {
      title: 'Task List',
      description: 'Checklist with boxes',
      icon: '☑',
      group: 'Text',
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
    {
      title: 'Blockquote',
      description: 'Pull quote or citation',
      icon: '"',
      group: 'Text',
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setBlockquote().run()
    },
    {
      title: 'Code Block',
      description: 'Monospace code section',
      icon: '<>',
      group: 'Text',
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setCodeBlock().run()
    },
    {
      title: 'Table',
      description: '3 × 3 table with header',
      icon: '⊞',
      group: 'Text',
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    },
    {
      title: 'Divider',
      description: 'Horizontal rule',
      icon: '—',
      group: 'Text',
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
    {
      title: 'YouTube Video',
      description: 'Embed a YouTube URL',
      icon: '▶',
      group: 'Media',
      command: ({ editor, range }) => {
        const url = window.prompt('YouTube URL');
        editor.chain().focus().deleteRange(range).run();
        if (url) {
          editor.commands.setYoutubeVideo({ src: url });
        }
      }
    },
    {
      title: 'Callout',
      description: 'Highlighted notice block',
      icon: '⚡',
      group: 'Layout',
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({
            type: 'callout',
            attrs: { variant: 'info' },
            content: [{ type: 'paragraph' }]
          })
          .run()
    }
  ];
}

export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        allowSpaces: false,
        startOfLine: false,
        command: ({ editor, range, props }) => {
          (props as SlashCommandItem).command({ editor, range });
        },
        items: ({ query }) => {
          const commands = buildCommands();
          if (!query) return commands;
          const q = query.toLowerCase();
          return commands.filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q) ||
              item.group.toLowerCase().includes(q)
          );
        },
        render: () => {
          let component: ReactRenderer<SlashCommandMenuHandle> | null = null;
          let popup: TippyInstance[] | null = null;

          return {
            onStart: (props: SuggestionProps) => {
              component = new ReactRenderer(SlashCommandMenu, {
                props: {
                  items: props.items,
                  command: (item: SlashCommandItem) => props.command(item)
                },
                editor: props.editor
              });

              if (!props.clientRect) return;

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start'
              });
            },
            onUpdate: (props: SuggestionProps) => {
              component?.updateProps({
                items: props.items,
                command: (item: SlashCommandItem) => props.command(item)
              });
              popup?.[0]?.setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect
              });
            },
            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                popup?.[0]?.hide();
                return true;
              }
              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => {
              popup?.[0]?.destroy();
              component?.destroy();
            }
          };
        }
      })
    ];
  }
});
