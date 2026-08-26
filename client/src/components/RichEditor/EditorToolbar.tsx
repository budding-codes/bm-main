import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Underline,
  Undo2,
  Youtube
} from 'lucide-react';
import { useRef, useState } from 'react';
import { adminFetch } from '../../lib/api';
import type { MediaAsset } from '../../types/media';
import { TableInsertPopover } from './TableInsertPopover';
import { FontFamilySelector } from './FontFamilySelector';
import {
  TEXT_ALIGNS,
  TEXT_ALIGN_ICONS,
  alignButtonLabel,
  alignButtonTitle,
  applyTextAlign,
  getAlignToolbarState
} from './textAlignUtils';

type EditorToolbarProps = {
  editor: Editor;
  token: string;
  onUnauthorized?: () => void;
  onRequestMediaLibrary?: () => void;
};

export function EditorToolbar({ editor, token, onUnauthorized, onRequestMediaLibrary }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableButtonRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [tablePickerOpen, setTablePickerOpen] = useState(false);

  const alignState = useEditorState({
    editor,
    selector: ({ editor: current }) => getAlignToolbarState(current)
  });

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

  const insertYoutube = () => {
    const url = window.prompt('YouTube URL');
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await adminFetch<{ asset: MediaAsset }>('/api/admin/media', {
        method: 'POST',
        token,
        body: formData,
        onUnauthorized
      });
      editor.chain().focus().setImage({
        src: data.asset.url,
        alt: data.asset.alt || data.asset.displayName || ''
      }).run();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bm-editor-toolbar">
      <div className="bm-editor-toolbar-group">
        <button type="button" className="bm-editor-btn" onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo2 size={15} />
        </button>
        <button type="button" className="bm-editor-btn" onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo2 size={15} />
        </button>
      </div>

      <div className="bm-editor-toolbar-divider" />

      <div className="bm-editor-toolbar-group">
        <button
          type="button"
          className={`bm-editor-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 size={15} />
        </button>
        <button
          type="button"
          className={`bm-editor-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </button>
        <button
          type="button"
          className={`bm-editor-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 size={15} />
        </button>
      </div>

      <div className="bm-editor-toolbar-divider" />

      <div className="bm-editor-toolbar-group">
        <FontFamilySelector editor={editor} />
      </div>

      <div className="bm-editor-toolbar-divider" />

      <div className="bm-editor-toolbar-group">
        <button type="button" className={`bm-editor-btn ${editor.isActive('bold') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <Bold size={15} />
        </button>
        <button type="button" className={`bm-editor-btn ${editor.isActive('italic') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <Italic size={15} />
        </button>
        <button type="button" className={`bm-editor-btn ${editor.isActive('underline') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <Underline size={15} />
        </button>
        <button type="button" className={`bm-editor-btn ${editor.isActive('strike') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <Strikethrough size={15} />
        </button>
        <button type="button" className={`bm-editor-btn ${editor.isActive('highlight') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight">
          <Highlighter size={15} />
        </button>
        <button type="button" className={`bm-editor-btn ${editor.isActive('code') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
          <Code size={15} />
        </button>
      </div>

      <div className="bm-editor-toolbar-divider" />

      <div className="bm-editor-toolbar-group" role="group" aria-label="Text alignment">
        {TEXT_ALIGNS.map((value) => {
          const Icon = TEXT_ALIGN_ICONS[value];
          const canApply =
            value === 'left'
              ? alignState.canLeft
              : value === 'center'
                ? alignState.canCenter
                : value === 'right'
                  ? alignState.canRight
                  : alignState.canJustify;
          const disabled =
            alignState.selectionAlign === null ||
            !canApply ||
            (value === 'justify' && alignState.isHeading);
          const isActive = alignState.selectionAlign === value;
          const disabledReason =
            value === 'justify' && alignState.isHeading
              ? 'Justify is for body text'
              : alignState.selectionAlign === null
                ? 'Alignment is not available here'
                : undefined;

          return (
            <button
              key={value}
              type="button"
              className={`bm-editor-btn${isActive ? ' is-active' : ''}`}
              title={alignButtonTitle(value, { disabledReason })}
              aria-label={alignButtonLabel(value)}
              aria-pressed={isActive}
              disabled={disabled}
              onClick={() => applyTextAlign(editor, value)}
            >
              <Icon size={15} />
            </button>
          );
        })}
      </div>

      <div className="bm-editor-toolbar-divider" />

      <div className="bm-editor-toolbar-group">
        <button type="button" className={`bm-editor-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={15} />
        </button>
        <button type="button" className={`bm-editor-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={15} />
        </button>
        <button type="button" className={`bm-editor-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={15} />
        </button>
        <div ref={tableButtonRef} className="bm-editor-toolbar-anchor">
          <button
            type="button"
            className={`bm-editor-btn${editor.isActive('table') ? ' is-active' : ''}`}
            title="Insert table"
            aria-expanded={tablePickerOpen}
            onClick={() => setTablePickerOpen((open) => !open)}
          >
            <TableIcon size={15} />
          </button>
          {tablePickerOpen ? (
            <TableInsertPopover editor={editor} onClose={() => setTablePickerOpen(false)} />
          ) : null}
        </div>
      </div>

      <div className="bm-editor-toolbar-divider" />

      <div className="bm-editor-toolbar-group">
        <button type="button" className={`bm-editor-btn ${editor.isActive('link') ? 'is-active' : ''}`} onClick={setLink} title="Link">
          <LinkIcon size={15} />
        </button>
        <button
          type="button"
          className="bm-editor-btn"
          disabled={uploading}
          onClick={() => (onRequestMediaLibrary ? onRequestMediaLibrary() : fileInputRef.current?.click())}
          title={uploading ? 'Uploading…' : 'Insert image'}
        >
          <ImageIcon size={15} />
        </button>
        <button type="button" className="bm-editor-btn" onClick={insertYoutube} title="YouTube">
          <Youtube size={15} />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void uploadImage(file);
          }
          event.target.value = '';
        }}
      />
    </div>
  );
}
