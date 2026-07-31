import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { useEffect, useRef } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { BubbleToolbar } from './BubbleToolbar';
import { createEditorExtensions } from './extensions';
import { SlashCommandExtension } from './extensions/slashCommand';
import type { MediaAsset } from '../../types/media';
import 'tippy.js/dist/tippy.css';
import './editor.css';

export type RichEditorUpdate = {
  html: string;
  json: Record<string, unknown>;
  wordCount: number;
  characterCount: number;
};

type RichEditorProps = {
  initialContent?: Record<string, unknown> | string | null;
  onUpdate: (update: RichEditorUpdate) => void;
  token: string;
  onUnauthorized?: () => void;
  onRequestMediaLibrary?: () => void;
  pendingImage?: MediaAsset | null;
  onPendingImageConsumed?: () => void;
  placeholder?: string;
};

export function RichEditor({
  initialContent,
  onUpdate,
  token,
  onUnauthorized,
  onRequestMediaLibrary,
  pendingImage,
  onPendingImageConsumed,
  placeholder
}: RichEditorProps) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const editor = useEditor({
    extensions: [
      ...createEditorExtensions(placeholder),
      SlashCommandExtension
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'bm-editor-canvas',
        spellcheck: 'true'
      }
    },
    onUpdate: ({ editor: current }) => {
      onUpdateRef.current({
        html: current.getHTML(),
        json: current.getJSON() as Record<string, unknown>,
        wordCount: current.storage.characterCount?.words?.() || 0,
        characterCount: current.storage.characterCount?.characters?.() || 0
      });
    },
    autofocus: false
  });

  useEffect(() => {
    if (!editor || !pendingImage) return;
    editor.chain().focus().setImage({
      src: pendingImage.url,
      alt: pendingImage.alt || pendingImage.displayName || ''
    }).run();
    onPendingImageConsumed?.();
  }, [editor, pendingImage, onPendingImageConsumed]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="bm-rich-editor">
      <EditorToolbar
        editor={editor}
        token={token}
        onUnauthorized={onUnauthorized}
        onRequestMediaLibrary={onRequestMediaLibrary}
      />
      <BubbleMenu editor={editor}>
        <BubbleToolbar editor={editor} />
      </BubbleMenu>
      <div className="bm-editor-content-wrapper">
        <EditorContent editor={editor} />
      </div>
      <div className="bm-editor-status-bar">
        <span>{editor.storage.characterCount?.words?.() || 0} words</span>
        <span>{editor.storage.characterCount?.characters?.() || 0} characters</span>
        <span>Type / for blocks</span>
      </div>
    </div>
  );
}
