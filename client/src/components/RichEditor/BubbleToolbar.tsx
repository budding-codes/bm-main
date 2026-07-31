import type { Editor } from '@tiptap/react';
import { Bold, Code, Highlighter, Italic, Link as LinkIcon, Strikethrough, Underline } from 'lucide-react';

type BubbleToolbarProps = {
  editor: Editor;
};

export function BubbleToolbar({ editor }: BubbleToolbarProps) {
  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previous || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="bm-bubble-toolbar">
      <button type="button" className={`bm-editor-btn ${editor.isActive('bold') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={14} />
      </button>
      <button type="button" className={`bm-editor-btn ${editor.isActive('italic') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={14} />
      </button>
      <button type="button" className={`bm-editor-btn ${editor.isActive('underline') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline size={14} />
      </button>
      <button type="button" className={`bm-editor-btn ${editor.isActive('strike') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={14} />
      </button>
      <button type="button" className={`bm-editor-btn ${editor.isActive('code') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code size={14} />
      </button>
      <button type="button" className={`bm-editor-btn ${editor.isActive('highlight') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleHighlight().run()}>
        <Highlighter size={14} />
      </button>
      <button type="button" className={`bm-editor-btn ${editor.isActive('link') ? 'is-active' : ''}`} onClick={setLink}>
        <LinkIcon size={14} />
      </button>
    </div>
  );
}
