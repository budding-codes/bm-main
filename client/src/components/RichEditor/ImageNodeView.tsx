import { useCallback, useEffect, useRef, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import {
  clampImageHeight,
  clampWidthToContainer,
  IMAGE_RESIZE_CURSORS,
  IMAGE_RESIZE_DIRECTIONS,
  isImageAlignment,
  isImageLayout,
  normalizeImageAttrs,
  resolveImageAspectRatio,
  type ImageResizeDirection
} from './imageUtils';

const EDITOR_CONTENT_MAX_WIDTH = 744;

function isCornerDirection(direction: ImageResizeDirection): boolean {
  return direction.length === 2;
}

export function ImageNodeView({ node, updateAttributes, selected, editor }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const naturalRatioRef = useRef<number | null>(null);
  const normalized = normalizeImageAttrs(node.attrs as Record<string, unknown>);
  const [displayWidth, setDisplayWidth] = useState<number | null>(normalized.width);
  const [displayHeight, setDisplayHeight] = useState<number | null>(normalized.height);
  const [isResizing, setIsResizing] = useState(false);

  const align = isImageAlignment(normalized.align) ? normalized.align : null;
  const layout = isImageLayout(normalized.layout) ? normalized.layout : 'inline';
  const isFullWidth = layout === 'full-width';
  const lockRatio = normalized.lockAspectRatio;

  const getMaxWidth = useCallback(() => {
    const container = containerRef.current;
    return Math.min(
      EDITOR_CONTENT_MAX_WIDTH,
      container?.parentElement?.clientWidth || EDITOR_CONTENT_MAX_WIDTH
    );
  }, []);

  const commitSize = useCallback(
    (width: number | null, height: number | null) => {
      updateAttributes({
        width,
        height
      });
    },
    [updateAttributes]
  );

  const syncNaturalDimensions = useCallback(() => {
    const img = imgRef.current;
    if (!img?.naturalWidth || !img.naturalHeight) {
      return;
    }
    naturalRatioRef.current = img.naturalWidth / img.naturalHeight;

    if (isFullWidth) {
      setDisplayWidth(null);
      setDisplayHeight(null);
      return;
    }

    if (!normalized.width && !normalized.height) {
      const initialWidth = Math.min(img.naturalWidth, getMaxWidth());
      const initialHeight = Math.round(initialWidth / naturalRatioRef.current);
      setDisplayWidth(initialWidth);
      setDisplayHeight(initialHeight);
      commitSize(initialWidth, initialHeight);
    }
  }, [commitSize, getMaxWidth, isFullWidth, normalized.height, normalized.width]);

  useEffect(() => {
    if (isFullWidth) {
      setDisplayWidth(null);
      setDisplayHeight(null);
      return;
    }
    setDisplayWidth(normalized.width);
    setDisplayHeight(normalized.height);
  }, [isFullWidth, normalized.width, normalized.height, normalized.src]);

  useEffect(() => {
    naturalRatioRef.current = null;
  }, [normalized.src]);

  const startResize = useCallback(
    (event: React.MouseEvent, direction: ImageResizeDirection) => {
      if (isFullWidth) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const img = imgRef.current;
      const container = containerRef.current;
      if (!img || !container) {
        return;
      }

      if (!naturalRatioRef.current && img.naturalWidth > 0) {
        naturalRatioRef.current = img.naturalWidth / img.naturalHeight;
      }

      const startX = event.clientX;
      const startY = event.clientY;
      const rect = container.getBoundingClientRect();
      const startWidth = rect.width;
      const startHeight = rect.height || startWidth / (naturalRatioRef.current || 1);
      const maxWidth = getMaxWidth();
      const ratio = resolveImageAspectRatio(startWidth, startHeight, naturalRatioRef.current);

      setIsResizing(true);

      const onMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        let nextWidth = startWidth;
        let nextHeight = startHeight;

        if (direction.includes('e')) {
          nextWidth = startWidth + deltaX;
        }
        if (direction.includes('w')) {
          nextWidth = startWidth - deltaX;
        }
        if (direction.includes('s')) {
          nextHeight = startHeight + deltaY;
        }
        if (direction.includes('n')) {
          nextHeight = startHeight - deltaY;
        }

        nextWidth = clampWidthToContainer(nextWidth, maxWidth);

        if (lockRatio) {
          if (isCornerDirection(direction)) {
            nextHeight = Math.round(nextWidth / ratio);
          } else if (direction === 'e' || direction === 'w') {
            nextHeight = Math.round(nextWidth / ratio);
          } else {
            nextHeight = clampImageHeight(nextHeight);
            nextWidth = clampWidthToContainer(Math.round(nextHeight * ratio), maxWidth);
          }
        } else {
          nextHeight = clampImageHeight(nextHeight);
        }

        setDisplayWidth(nextWidth);
        setDisplayHeight(nextHeight);
      };

      const onUp = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);

        const finalRect = container.getBoundingClientRect();
        const finalWidth = clampWidthToContainer(finalRect.width, maxWidth);
        const finalHeight = clampImageHeight(
          finalRect.height || Math.round(finalWidth / ratio)
        );
        commitSize(finalWidth, finalHeight);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [commitSize, getMaxWidth, isFullWidth, lockRatio]
  );

  const resolvedWidth = isFullWidth ? undefined : displayWidth || undefined;
  const resolvedHeight = isFullWidth ? undefined : displayHeight || undefined;

  const wrapperClasses = [
    'bm-image-node-view',
    `bm-image-node-view--layout-${layout}`,
    align ? `bm-image-node-view--${align}` : '',
    normalized.spacing !== 'medium' ? `bm-image-node-view--spacing-${normalized.spacing}` : '',
    selected ? 'is-selected' : '',
    isResizing ? 'is-resizing' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <NodeViewWrapper as="figure" className={wrapperClasses} data-drag-handle data-layout={layout}>
      <div
        ref={containerRef}
        className={`bm-image-resize-container${isFullWidth ? ' bm-image-resize-container--full-width' : ''}`}
        style={{
          width: isFullWidth ? '100%' : resolvedWidth ? `${resolvedWidth}px` : '100%',
          maxWidth: '100%'
        }}
      >
        <img
          ref={imgRef}
          src={normalized.src}
          alt={normalized.alt}
          className="bm-content-image"
          draggable={false}
          loading="lazy"
          decoding="async"
          width={resolvedWidth}
          height={resolvedHeight}
          onLoad={syncNaturalDimensions}
          onError={() => {
            editor.commands.focus();
          }}
          style={{
            width: isFullWidth ? '100%' : resolvedWidth ? `${resolvedWidth}px` : '100%',
            height: isFullWidth ? 'auto' : resolvedHeight ? `${resolvedHeight}px` : 'auto',
            maxWidth: '100%'
          }}
        />
        {selected && !isFullWidth
          ? IMAGE_RESIZE_DIRECTIONS.map((direction) => (
              <span
                key={direction}
                className={`bm-image-resize-zone bm-image-resize-zone--${direction}`}
                style={{ cursor: IMAGE_RESIZE_CURSORS[direction] }}
                aria-hidden="true"
                onMouseDown={(event) => startResize(event, direction)}
              />
            ))
          : null}
      </div>
      {normalized.caption ? (
        <figcaption className="bm-content-image-caption">{normalized.caption}</figcaption>
      ) : null}
    </NodeViewWrapper>
  );
}
