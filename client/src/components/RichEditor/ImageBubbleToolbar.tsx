import type { Editor } from '@tiptap/react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  ImageIcon,
  LayoutTemplate,
  Maximize2,
  Trash2
} from 'lucide-react';
import { useCallback, useEffect, useReducer, useRef, useState, type Ref } from 'react';
import {
  detectSizePreset,
  IMAGE_ALIGNMENTS,
  IMAGE_LAYOUT_LABELS,
  IMAGE_LAYOUTS,
  IMAGE_MAX_WIDTH,
  IMAGE_MIN_WIDTH,
  IMAGE_SIZE_PRESET_LABELS,
  IMAGE_SIZE_PRESET_WIDTHS,
  IMAGE_SPACINGS,
  isImageAlignment,
  isImageLayout,
  isImageSpacing,
  normalizeImageAttrs,
  normalizeImageHeight,
  normalizeImageWidth,
  resolveImageAspectRatio,
  type ImageAlignment,
  type ImageLayout,
  type ImageSizePreset,
  type ImageSpacing
} from './imageUtils';

export type ImageBubbleToolbarHandle = {
  flushPendingChanges: () => void;
};

type ImageBubbleToolbarProps = {
  editor: Editor;
  onRequestReplace?: () => void;
  toolbarRef?: Ref<ImageBubbleToolbarHandle>;
};

type PanelKey = 'layout' | 'size' | 'advanced' | null;

export function ImageBubbleToolbar({ editor, onRequestReplace, toolbarRef }: ImageBubbleToolbarProps) {
  const [, rerender] = useReducer((value: number) => value + 1, 0);
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const attrs = normalizeImageAttrs(editor.getAttributes('image') as Record<string, unknown>);
  const [widthInput, setWidthInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [altInput, setAltInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');
  const [dimensionError, setDimensionError] = useState<string | null>(null);

  const currentAlign = isImageAlignment(attrs.align) ? attrs.align : null;
  const currentLayout = isImageLayout(attrs.layout) ? attrs.layout : 'inline';
  const currentSpacing = isImageSpacing(attrs.spacing) ? attrs.spacing : 'medium';
  const lockAspect = attrs.lockAspectRatio;
  const sizePreset = detectSizePreset(attrs);
  const aspectRatio = resolveImageAspectRatio(attrs.width, attrs.height, null);

  const applyAlt = useCallback(() => {
    editor.chain().focus().updateAttributes('image', { alt: altInput.trim() }).run();
  }, [altInput, editor]);

  const applyCaption = useCallback(() => {
    editor.chain().focus().updateAttributes('image', { caption: captionInput.trim() }).run();
  }, [captionInput, editor]);

  const applyDimensions = useCallback(() => {
    if (currentLayout === 'full-width') {
      setDimensionError(null);
      return;
    }

    if (!widthInput.trim()) {
      setDimensionError(null);
      return;
    }

    const width = normalizeImageWidth(widthInput);
    if (!width) {
      setDimensionError(`Width must be between ${IMAGE_MIN_WIDTH}px and ${IMAGE_MAX_WIDTH}px.`);
      return;
    }

    let height = normalizeImageHeight(heightInput, width, aspectRatio || 1);
    if (lockAspect && aspectRatio) {
      height = Math.round(width / aspectRatio);
      setHeightInput(String(height));
    } else if (!height) {
      setDimensionError(`Height must be at least ${IMAGE_MIN_WIDTH}px.`);
      return;
    }

    setDimensionError(null);
    editor.chain().focus().setImageSize({ width, height, aspectRatio: aspectRatio || undefined }).run();
  }, [aspectRatio, currentLayout, editor, heightInput, lockAspect, widthInput]);

  const flushPendingChanges = useCallback(() => {
    applyAlt();
    applyCaption();
    applyDimensions();
  }, [applyAlt, applyCaption, applyDimensions]);

  useEffect(() => {
    if (!toolbarRef) {
      return;
    }
    const handle: ImageBubbleToolbarHandle = { flushPendingChanges };
    if (typeof toolbarRef === 'function') {
      toolbarRef(handle);
    } else {
      toolbarRef.current = handle;
    }
  }, [flushPendingChanges, toolbarRef]);

  useEffect(() => {
    const refresh = () => rerender();
    editor.on('transaction', refresh);
    return () => {
      editor.off('transaction', refresh);
    };
  }, [editor]);

  useEffect(() => {
    setWidthInput(attrs.width ? String(attrs.width) : '');
    setHeightInput(attrs.height ? String(attrs.height) : '');
    setAltInput(attrs.alt);
    setCaptionInput(attrs.caption);
  }, [attrs.width, attrs.height, attrs.alt, attrs.caption, attrs.src]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const applyAlign = (align: ImageAlignment) => {
    editor.chain().focus().setImageAlign(align).run();
  };

  const applyLayout = (layout: ImageLayout) => {
    editor.chain().focus().setImageLayout(layout).run();
    setOpenPanel(null);
  };

  const applySpacing = (spacing: ImageSpacing) => {
    editor.chain().focus().setImageSpacing(spacing).run();
  };

  const applySizePreset = (preset: ImageSizePreset) => {
    if (preset === 'custom') {
      setOpenPanel('size');
      return;
    }

    if (preset === 'full-width') {
      editor.chain().focus().setImageLayout('full-width').run();
      setOpenPanel(null);
      return;
    }

    if (preset === 'original') {
      const img = document.querySelector('.bm-image-node-view.is-selected img') as HTMLImageElement | null;
      const naturalWidth = img?.naturalWidth;
      if (!naturalWidth) {
        return;
      }
      const width = normalizeImageWidth(naturalWidth);
      if (!width) {
        return;
      }
      const height = lockAspect
        ? Math.round(width / resolveImageAspectRatio(width, attrs.height, img.naturalWidth / img.naturalHeight))
        : attrs.height;
      editor
        .chain()
        .focus()
        .setImageSize({ width, height, aspectRatio: img.naturalWidth / img.naturalHeight, layout: 'inline' })
        .run();
      setOpenPanel(null);
      return;
    }

    const width = IMAGE_SIZE_PRESET_WIDTHS[preset];
    const height = lockAspect && aspectRatio ? Math.round(width / aspectRatio) : attrs.height;
    editor.chain().focus().setImageSize({ width, height, aspectRatio: aspectRatio || undefined, layout: 'inline' }).run();
    setOpenPanel(null);
  };

  const setLockAspect = (value: boolean) => {
    editor.chain().focus().updateAttributes('image', { lockAspectRatio: value }).run();
    rerender();
  };

  const removeImage = () => {
    editor.chain().focus().deleteSelection().run();
  };

  const togglePanel = (panel: PanelKey) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  return (
    <div ref={panelRef} className="bm-image-bubble-toolbar">
      <div className="bm-image-bubble-toolbar-row">
        {IMAGE_ALIGNMENTS.map((align) => {
          const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
          return (
            <button
              key={align}
              type="button"
              className={`bm-editor-btn ${currentAlign === align ? 'is-active' : ''}`}
              title={`Align image ${align}`}
              aria-label={`Align image ${align}`}
              onClick={() => applyAlign(align)}
            >
              <Icon size={14} />
            </button>
          );
        })}

        <span className="bm-image-bubble-divider" />

        <div className="bm-image-toolbar-anchor">
          <button
            type="button"
            className={`bm-editor-btn bm-image-toolbar-menu-btn ${openPanel === 'layout' ? 'is-active' : ''}`}
            title="Image layout"
            aria-label="Image layout"
            onClick={() => togglePanel('layout')}
          >
            <LayoutTemplate size={14} />
            <ChevronDown size={12} />
          </button>
          {openPanel === 'layout' ? (
            <div className="bm-image-toolbar-popover" role="menu" aria-label="Image layout options">
              {IMAGE_LAYOUTS.map((layout) => (
                <button
                  key={layout}
                  type="button"
                  role="menuitem"
                  className={`bm-image-toolbar-popover-item ${currentLayout === layout ? 'is-active' : ''}`}
                  onClick={() => applyLayout(layout)}
                >
                  {IMAGE_LAYOUT_LABELS[layout]}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="bm-image-toolbar-anchor">
          <button
            type="button"
            className={`bm-editor-btn bm-image-toolbar-menu-btn ${openPanel === 'size' ? 'is-active' : ''}`}
            title="Image size"
            aria-label="Image size"
            onClick={() => togglePanel('size')}
          >
            <Maximize2 size={14} />
            <ChevronDown size={12} />
          </button>
          {openPanel === 'size' ? (
            <div className="bm-image-toolbar-popover bm-image-toolbar-popover--wide" role="menu" aria-label="Image size options">
              {(Object.keys(IMAGE_SIZE_PRESET_LABELS) as ImageSizePreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  role="menuitem"
                  className={`bm-image-toolbar-popover-item ${sizePreset === preset ? 'is-active' : ''}`}
                  onClick={() => applySizePreset(preset)}
                >
                  {IMAGE_SIZE_PRESET_LABELS[preset]}
                </button>
              ))}
              {sizePreset === 'custom' || openPanel === 'size' ? (
                <div className="bm-image-toolbar-custom-size">
                  <label className="bm-image-field">
                    <span>W</span>
                    <input
                      type="number"
                      min={IMAGE_MIN_WIDTH}
                      max={IMAGE_MAX_WIDTH}
                      value={widthInput}
                      disabled={currentLayout === 'full-width'}
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
                      disabled={lockAspect || currentLayout === 'full-width'}
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
                  {dimensionError ? (
                    <p className="bm-image-dimension-error" role="alert">
                      {dimensionError}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <span className="bm-image-bubble-divider" />

        <button
          type="button"
          className="bm-editor-btn"
          title="Replace image"
          aria-label="Replace image"
          onClick={() => onRequestReplace?.()}
        >
          <ImageIcon size={14} />
        </button>
        <button
          type="button"
          className="bm-editor-btn"
          title="Delete image"
          aria-label="Delete image"
          onClick={removeImage}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="bm-image-bubble-toolbar-row">
        <button
          type="button"
          className={`bm-image-advanced-toggle ${openPanel === 'advanced' ? 'is-active' : ''}`}
          onClick={() => togglePanel('advanced')}
        >
          Advanced
          <ChevronDown size={12} />
        </button>
      </div>

      {openPanel === 'advanced' ? (
        <div className="bm-image-advanced-panel">
          <input
            type="text"
            className="bm-image-alt-input"
            value={altInput}
            placeholder="Describe the important visual content of this image."
            aria-label="Alt text"
            onChange={(event) => setAltInput(event.target.value)}
            onBlur={applyAlt}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyAlt();
              }
            }}
          />
          <input
            type="text"
            className="bm-image-alt-input"
            value={captionInput}
            placeholder="Caption (optional)"
            aria-label="Image caption"
            onChange={(event) => setCaptionInput(event.target.value)}
            onBlur={applyCaption}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyCaption();
              }
            }}
          />
          <div className="bm-image-spacing-row" role="group" aria-label="Image spacing">
            {IMAGE_SPACINGS.map((spacing) => (
              <button
                key={spacing}
                type="button"
                className={`bm-image-spacing-btn ${currentSpacing === spacing ? 'is-active' : ''}`}
                onClick={() => applySpacing(spacing)}
              >
                {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
