import { useCallback, useEffect, useRef, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import {
  clampImageHeight,
  clampWidthToContainer,
  IMAGE_RESIZE_CURSORS,
  IMAGE_RESIZE_DIRECTIONS,
  isImageAlignment,
  resolveImageAspectRatio,
  type ImageAlignment,
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
  const [displayWidth, setDisplayWidth] = useState<number | null>(node.attrs.width as number | null);
  const [displayHeight, setDisplayHeight] = useState<number | null>(node.attrs.height as number | null);
  const [isResizing, setIsResizing] = useState(false);

  const align = isImageAlignment(node.attrs.align) ? (node.attrs.align as ImageAlignment) : null;
  const src = String(node.attrs.src || '');
  const alt = String(node.attrs.alt || '');

  const getMaxWidth = useCallback(() => {
    const container = containerRef.current;
    return Math.min(
      EDITOR_CONTENT_MAX_WIDTH,
      container?.parentElement?.clientWidth || EDITOR_CONTENT_MAX_WIDTH
    );
  }, []);

  const commitSize = useCallback(
    (width: number, height: number) => {
      updateAttributes({
        width: Math.round(width),
        height: Math.round(height)
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

    if (!node.attrs.width && !node.attrs.height) {
      const initialWidth = Math.min(img.naturalWidth, getMaxWidth());
      const initialHeight = Math.round(initialWidth / naturalRatioRef.current);
      setDisplayWidth(initialWidth);
      setDisplayHeight(initialHeight);
      commitSize(initialWidth, initialHeight);
    }
  }, [commitSize, getMaxWidth, node.attrs.height, node.attrs.width]);

  useEffect(() => {
    setDisplayWidth((node.attrs.width as number | null) || null);
    setDisplayHeight((node.attrs.height as number | null) || null);
  }, [node.attrs.width, node.attrs.height, src]);

  useEffect(() => {
    naturalRatioRef.current = null;
  }, [src]);

  const startResize = useCallback(
    (event: React.MouseEvent, direction: ImageResizeDirection) => {
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
      const lockRatio = editor.storage.image?.lockRatio !== false;
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
    [commitSize, editor.storage.image, getMaxWidth]
  );

  const resolvedWidth = displayWidth || undefined;
  const resolvedHeight = displayHeight || undefined;

  return (
    <NodeViewWrapper
      as="div"
      className={`bm-image-node-view${align ? ` bm-image-node-view--${align}` : ''}${selected ? ' is-selected' : ''}${isResizing ? ' is-resizing' : ''}`}
      data-drag-handle
    >
      <div
        ref={containerRef}
        className="bm-image-resize-container"
        style={{
          width: resolvedWidth ? `${resolvedWidth}px` : '100%',
          maxWidth: '100%'
        }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
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
            width: resolvedWidth ? `${resolvedWidth}px` : '100%',
            height: resolvedHeight ? `${resolvedHeight}px` : 'auto',
            maxWidth: '100%'
          }}
        />
        {selected
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
    </NodeViewWrapper>
  );
}
