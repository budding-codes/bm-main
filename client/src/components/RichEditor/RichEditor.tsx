import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { BubbleToolbar } from './BubbleToolbar';
import { ImageBubbleToolbar, type ImageBubbleToolbarHandle } from './ImageBubbleToolbar';
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

export type PendingImageAction = {
  asset: MediaAsset;
  mode: 'insert';
} | {
  asset: MediaAsset;
  mode: 'replace';
  preserveConfig?: boolean;
};

export type RichEditorHandle = {
  getContent: () => RichEditorUpdate | null;
  flushPendingChanges: () => void;
};

type RichEditorProps = {
  initialContent?: Record<string, unknown> | string | null;
  onUpdate: (update: RichEditorUpdate) => void;
  token: string;
  onUnauthorized?: () => void;
  onRequestMediaLibrary?: () => void;
  onRequestImageReplace?: () => void;
  pendingImage?: PendingImageAction | MediaAsset | null;
  onPendingImageConsumed?: () => void;
  placeholder?: string;
};

function resolvePendingImage(pending?: PendingImageAction | MediaAsset | null): PendingImageAction | null {
  if (!pending) {
    return null;
  }
  if ('asset' in pending) {
    return pending;
  }
  return { asset: pending, mode: 'insert' };
}

function buildEditorUpdate(editor: NonNullable<ReturnType<typeof useEditor>>): RichEditorUpdate {
  return {
    html: editor.getHTML(),
    json: editor.getJSON() as Record<string, unknown>,
    wordCount: editor.storage.characterCount?.words?.() || 0,
    characterCount: editor.storage.characterCount?.characters?.() || 0
  };
}

export const RichEditor = forwardRef<RichEditorHandle, RichEditorProps>(function RichEditor(
  {
    initialContent,
    onUpdate,
    token,
    onUnauthorized,
    onRequestMediaLibrary,
    onRequestImageReplace,
    pendingImage,
    onPendingImageConsumed,
    placeholder
  },
  ref
) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const imageToolbarRef = useRef<ImageBubbleToolbarHandle | null>(null);
  const [editorScrollTarget, setEditorScrollTarget] = useState<HTMLElement | Window>(() =>
    typeof window !== 'undefined' ? window : (null as unknown as Window)
  );

  const editor = useEditor({
    extensions: [
      ...createEditorExtensions(placeholder),
      SlashCommandExtension
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'bm-editor-canvas',
        spellcheck: 'true',
        lang: 'en'
      }
    },
    onUpdate: ({ editor: current }) => {
      onUpdateRef.current(buildEditorUpdate(current));
    },
    autofocus: false
  });

  useImperativeHandle(
    ref,
    () => ({
      getContent: () => (editor ? buildEditorUpdate(editor) : null),
      flushPendingChanges: () => {
        imageToolbarRef.current?.flushPendingChanges();
        if (editor) {
          onUpdateRef.current(buildEditorUpdate(editor));
        }
      }
    }),
    [editor]
  );

  useEffect(() => {
    const action = resolvePendingImage(pendingImage);
    if (!editor || !action) {
      return;
    }

    const alt = action.asset.alt || action.asset.displayName || '';
    if (action.mode === 'replace' && editor.isActive('image')) {
      editor
        .chain()
        .focus()
        .replaceImage({
          src: action.asset.url,
          alt,
          preserveConfig: action.preserveConfig !== false
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .setImage({
          src: action.asset.url,
          alt
        })
        .run();
    }

    onPendingImageConsumed?.();
  }, [editor, pendingImage, onPendingImageConsumed]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  useLayoutEffect(() => {
    if (contentWrapperRef.current) {
      setEditorScrollTarget(contentWrapperRef.current);
    }
  }, []);

  const imageBubbleMenuOptions = useMemo(
    () => ({
      strategy: 'fixed' as const,
      placement: 'top' as const,
      offset: 10,
      flip: { padding: 12 },
      shift: { padding: 12 },
      scrollTarget: editorScrollTarget
    }),
    [editorScrollTarget]
  );

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
      <BubbleMenu
        editor={editor}
        pluginKey="imageBubbleMenu"
        appendTo={() => document.body}
        options={imageBubbleMenuOptions}
        shouldShow={({ editor: current }) => current.isActive('image')}
      >
        <ImageBubbleToolbar
          editor={editor}
          toolbarRef={imageToolbarRef}
          onRequestReplace={() => onRequestImageReplace?.()}
        />
      </BubbleMenu>
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor: current, state }) => {
          if (current.isActive('image')) {
            return false;
          }
          const { from, to, empty } = state.selection;
          return !empty && from !== to;
        }}
      >
        <BubbleToolbar editor={editor} />
      </BubbleMenu>
      <div ref={contentWrapperRef} className="bm-editor-content-wrapper">
        <EditorContent editor={editor} />
      </div>
      <div className="bm-editor-status-bar">
        <span>{editor.storage.characterCount?.words?.() || 0} words</span>
        <span>{editor.storage.characterCount?.characters?.() || 0} characters</span>
        <span>Type / for blocks</span>
      </div>
    </div>
  );
});
