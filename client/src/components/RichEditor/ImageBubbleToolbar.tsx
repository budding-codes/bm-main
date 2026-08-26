import type { Editor } from '@tiptap/react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ImageIcon,
  Trash2
} from 'lucide-react';
import { useEffect, useReducer, useState } from 'react';
import {
  IMAGE_ALIGNMENTS,
  IMAGE_MAX_WIDTH,
  IMAGE_MIN_WIDTH,
  isImageAlignment,
  normalizeImageHeight,
  normalizeImageWidth,
  resolveImageAspectRatio,
  type ImageAlignment
} from './imageUtils';

type ImageBubbleToolbarProps = {
  editor: Editor;
  onRequestReplace?: () => void;
};

export function ImageBubbleToolbar({ editor, onRequestReplace }: ImageBubbleToolbarProps) {
  const [, rerender] = useReducer((value: number) => value + 1, 0);
  const attrs = editor.getAttributes('image');
  const [widthInput, setWidthInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [altInput, setAltInput] = useState('');
  const lockAspect = editor.storage.image?.lockRatio !== false;

  const setLockAspect = (value: boolean) => {
    if (editor.storage.image) {
      editor.storage.image.lockRatio = value;
    }
    rerender();
  };

  useEffect(() => {
    const refresh = () => rerender();
    editor.on('transaction', refresh);
    return () => {
      editor.off('transaction', refresh);
    };
  }, [editor]);

  useEffect(() => {
    const width = attrs.width ? String(attrs.width) : '';
    const height = attrs.height ? String(attrs.height) : '';
    setWidthInput(width);
    setHeightInput(height);
    setAltInput(String(attrs.alt || ''));
  }, [attrs.width, attrs.height, attrs.alt, attrs.src]);

  const currentAlign = isImageAlignment(attrs.align) ? attrs.align : null;
  const aspectRatio =
    attrs.width && attrs.height
      ? resolveImageAspectRatio(Number(attrs.width), Number(attrs.height), null)
      : null;

  const applyAlign = (align: ImageAlignment) => {
    editor.chain().focus().setImageAlign(align).run();
  };

  const applyAlt = () => {
    editor.chain().focus().updateAttributes('image', { alt: altInput.trim() }).run();
  };

  const applyDimensions = () => {
    const width = normalizeImageWidth(widthInput);
    if (!width) {
      window.alert(`Width must be between ${IMAGE_MIN_WIDTH}px and ${IMAGE_MAX_WIDTH}px.`);
      return;
    }

    let height = normalizeImageHeight(heightInput, width, aspectRatio || 1);
    if (lockAspect && aspectRatio) {
      height = Math.round(width / aspectRatio);
      setHeightInput(String(height));
    } else if (!height) {
      window.alert(`Height must be at least ${IMAGE_MIN_WIDTH}px.`);
      return;
    }

    editor.chain().focus().setImageSize({ width, height, aspectRatio: aspectRatio || undefined }).run();
  };

  const removeImage = () => {
    editor.chain().focus().deleteSelection().run();
  };

  return (
    <div className="bm-image-bubble-toolbar">
      <div className="bm-image-bubble-toolbar-row">
        {IMAGE_ALIGNMENTS.map((align) => {
          const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
          return (
            <button
              key={align}
              type="button"
              className={`bm-editor-btn ${currentAlign === align ? 'is-active' : ''}`}
              title={`Align ${align}`}
              onClick={() => applyAlign(align)}
            >
              <Icon size={14} />
            </button>
          );
        })}
        <span className="bm-image-bubble-divider" />
        <button
          type="button"
          className="bm-editor-btn"
          title="Replace image"
          onClick={() => onRequestReplace?.()}
        >
          <ImageIcon size={14} />
        </button>
        <button type="button" className="bm-editor-btn" title="Remove image" onClick={removeImage}>
          <Trash2 size={14} />
        </button>
      </div>

      <div className="bm-image-bubble-toolbar-row bm-image-bubble-toolbar-fields">
        <label className="bm-image-field">
          <span>W</span>
          <input
            type="number"
            min={IMAGE_MIN_WIDTH}
            max={IMAGE_MAX_WIDTH}
            value={widthInput}
            onChange={(event) => {
              const nextWidth = event.target.value;
              setWidthInput(nextWidth);
              if (lockAspect && aspectRatio) {
                const normalized = normalizeImageWidth(nextWidth);
                if (normalized) {
                  setHeightInput(String(Math.round(normalized / aspectRatio)));
                }
              }
            }}
            onBlur={applyDimensions}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyDimensions();
              }
            }}
          />
        </label>
        <label className="bm-image-field">
          <span>H</span>
          <input
            type="number"
            min={IMAGE_MIN_WIDTH}
            max={IMAGE_MAX_WIDTH * 3}
            value={heightInput}
            disabled={lockAspect}
            onChange={(event) => setHeightInput(event.target.value)}
            onBlur={applyDimensions}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyDimensions();
              }
            }}
          />
        </label>
        <label className="bm-image-lock-aspect">
          <input
            type="checkbox"
            checked={lockAspect}
            onChange={(event) => setLockAspect(event.target.checked)}
          />
          <span>Lock ratio</span>
        </label>
      </div>

      <div className="bm-image-bubble-toolbar-row">
        <input
          type="text"
          className="bm-image-alt-input"
          value={altInput}
          placeholder="Alt text (accessibility)"
          onChange={(event) => setAltInput(event.target.value)}
          onBlur={applyAlt}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              applyAlt();
            }
          }}
        />
      </div>
    </div>
  );
}
