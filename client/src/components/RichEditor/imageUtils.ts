export const IMAGE_MIN_WIDTH = 80;
export const IMAGE_MAX_WIDTH = 1200;
export const IMAGE_ALIGNMENTS = ['left', 'center', 'right'] as const;

export type ImageAlignment = (typeof IMAGE_ALIGNMENTS)[number];

export function isImageAlignment(value: unknown): value is ImageAlignment {
  return typeof value === 'string' && IMAGE_ALIGNMENTS.includes(value as ImageAlignment);
}

export function normalizeImageWidth(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.round(Math.min(IMAGE_MAX_WIDTH, Math.max(IMAGE_MIN_WIDTH, parsed)));
}

export function normalizeImageHeight(value: unknown, width: number, aspectRatio: number): number | null {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.round(Math.min(IMAGE_MAX_WIDTH * 3, Math.max(IMAGE_MIN_WIDTH, parsed)));
  }
  if (width > 0 && aspectRatio > 0) {
    return Math.round(width / aspectRatio);
  }
  return null;
}

export function clampWidthToContainer(width: number, containerWidth: number): number {
  const max = Math.min(IMAGE_MAX_WIDTH, Math.max(IMAGE_MIN_WIDTH, containerWidth));
  return Math.round(Math.min(max, Math.max(IMAGE_MIN_WIDTH, width)));
}

export function buildImageStyle(width: number | null | undefined): string | undefined {
  if (!width) {
    return undefined;
  }
  return `width: ${width}px; max-width: 100%; height: auto;`;
}

export function buildImageClassName(align: ImageAlignment | null | undefined, extra?: string): string {
  const classes = ['bm-content-image'];
  if (extra) {
    classes.push(extra);
  }
  if (align) {
    classes.push(`bm-content-image--align-${align}`);
  }
  return classes.join(' ');
}

export const IMAGE_RESIZE_DIRECTIONS = [
  'n',
  's',
  'e',
  'w',
  'ne',
  'nw',
  'se',
  'sw'
] as const;

export type ImageResizeDirection = (typeof IMAGE_RESIZE_DIRECTIONS)[number];

export const IMAGE_RESIZE_CURSORS: Record<ImageResizeDirection, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
  sw: 'nesw-resize'
};

export function clampImageHeight(height: number): number {
  return Math.round(Math.min(IMAGE_MAX_WIDTH * 3, Math.max(IMAGE_MIN_WIDTH, height)));
}

export function resolveImageAspectRatio(
  width: number | null | undefined,
  height: number | null | undefined,
  naturalRatio: number | null | undefined
): number {
  if (width && height && height > 0) {
    return width / height;
  }
  if (naturalRatio && naturalRatio > 0) {
    return naturalRatio;
  }
  return 1;
}
