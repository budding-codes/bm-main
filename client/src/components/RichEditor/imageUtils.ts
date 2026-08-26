import { sanitizeLinkUrl } from '../../lib/linkUtils';

export const IMAGE_MIN_WIDTH = 80;
export const IMAGE_MAX_WIDTH = 1200;
export const IMAGE_ALIGNMENTS = ['left', 'center', 'right'] as const;
export const IMAGE_LAYOUTS = ['inline', 'wrap-left', 'wrap-right', 'full-width'] as const;
export const IMAGE_SPACINGS = ['small', 'medium', 'large'] as const;
export const IMAGE_SIZE_PRESET_KEYS = ['small', 'medium', 'large', 'original', 'full-width', 'custom'] as const;

export type ImageAlignment = (typeof IMAGE_ALIGNMENTS)[number];
export type ImageLayout = (typeof IMAGE_LAYOUTS)[number];
export type ImageSpacing = (typeof IMAGE_SPACINGS)[number];
export type ImageSizePreset = (typeof IMAGE_SIZE_PRESET_KEYS)[number];

export type NormalizedImageAttrs = {
  src: string;
  alt: string;
  href: string | null;
  width: number | null;
  height: number | null;
  align: ImageAlignment | null;
  layout: ImageLayout;
  caption: string;
  spacing: ImageSpacing;
  lockAspectRatio: boolean;
};

export const IMAGE_SIZE_PRESET_WIDTHS: Record<Exclude<ImageSizePreset, 'original' | 'full-width' | 'custom'>, number> = {
  small: 240,
  medium: 480,
  large: 720
};

export function isImageAlignment(value: unknown): value is ImageAlignment {
  return typeof value === 'string' && IMAGE_ALIGNMENTS.includes(value as ImageAlignment);
}

export function isImageLayout(value: unknown): value is ImageLayout {
  return typeof value === 'string' && IMAGE_LAYOUTS.includes(value as ImageLayout);
}

export function isImageSpacing(value: unknown): value is ImageSpacing {
  return typeof value === 'string' && IMAGE_SPACINGS.includes(value as ImageSpacing);
}

export function isImageSizePreset(value: unknown): value is ImageSizePreset {
  return typeof value === 'string' && IMAGE_SIZE_PRESET_KEYS.includes(value as ImageSizePreset);
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

export function normalizeImageAttrs(attrs: Record<string, unknown> = {}): NormalizedImageAttrs {
  const layout = isImageLayout(attrs.layout) ? attrs.layout : 'inline';
  let align = isImageAlignment(attrs.align) ? attrs.align : null;
  let width = normalizeImageWidth(attrs.width);
  let height = normalizeImageWidth(attrs.height);
  const spacing = isImageSpacing(attrs.spacing) ? attrs.spacing : 'medium';
  const lockAspectRatio = attrs.lockAspectRatio !== false;
  const caption = typeof attrs.caption === 'string' ? attrs.caption.trim() : '';
  const src = typeof attrs.src === 'string' ? attrs.src : '';
  const alt = typeof attrs.alt === 'string' ? attrs.alt : '';
  const href = sanitizeLinkUrl(typeof attrs.href === 'string' ? attrs.href : '');

  if (layout === 'full-width') {
    width = null;
    height = null;
    align = 'center';
  } else if (layout === 'wrap-left') {
    align = align || 'left';
  } else if (layout === 'wrap-right') {
    align = align || 'right';
  }

  if (width && !height && lockAspectRatio) {
    height = normalizeImageHeight(null, width, 1);
  }

  return {
    src,
    alt,
    href,
    width,
    height,
    align,
    layout,
    caption,
    spacing,
    lockAspectRatio
  };
}

export function buildImageStyle(width: number | null | undefined, layout: ImageLayout = 'inline'): string | undefined {
  if (layout === 'full-width') {
    return 'width: 100%; max-width: 100%; height: auto;';
  }
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

export function buildFigureClassName(attrs: Pick<NormalizedImageAttrs, 'align' | 'layout' | 'spacing'>): string {
  const classes = ['bm-content-image-figure'];
  if (attrs.layout) {
    classes.push(`bm-content-image-figure--layout-${attrs.layout}`);
  }
  if (attrs.align) {
    classes.push(`bm-content-image-figure--align-${attrs.align}`);
  }
  if (attrs.spacing) {
    classes.push(`bm-content-image-figure--spacing-${attrs.spacing}`);
  }
  return classes.join(' ');
}

export function shouldRenderFigure(attrs: NormalizedImageAttrs): boolean {
  return Boolean(attrs.caption) || attrs.layout !== 'inline' || Boolean(attrs.align) || attrs.spacing !== 'medium';
}

export function resolveLayoutDimensions(
  attrs: Pick<NormalizedImageAttrs, 'width' | 'height' | 'layout' | 'lockAspectRatio'>,
  naturalWidth?: number | null,
  naturalHeight?: number | null
): Pick<NormalizedImageAttrs, 'width' | 'height'> {
  if (attrs.layout === 'full-width') {
    return { width: null, height: null };
  }

  if (attrs.width) {
    const ratio =
      naturalWidth && naturalHeight && naturalHeight > 0
        ? naturalWidth / naturalHeight
        : attrs.height && attrs.height > 0
          ? attrs.width / attrs.height
          : 1;

    return {
      width: attrs.width,
      height:
        attrs.height ??
        (attrs.lockAspectRatio !== false ? normalizeImageHeight(null, attrs.width, ratio) : null)
    };
  }

  const width =
    naturalWidth && naturalWidth > 0
      ? normalizeImageWidth(Math.min(naturalWidth, IMAGE_SIZE_PRESET_WIDTHS.large))
      : IMAGE_SIZE_PRESET_WIDTHS.medium;

  if (!width) {
    return { width: null, height: null };
  }

  const ratio =
    naturalWidth && naturalHeight && naturalHeight > 0 ? naturalWidth / naturalHeight : 1;
  const height =
    attrs.lockAspectRatio !== false
      ? normalizeImageHeight(null, width, ratio)
      : attrs.height ?? normalizeImageHeight(null, width, ratio);

  return { width, height };
}

export function detectSizePreset(
  attrs: Pick<NormalizedImageAttrs, 'width' | 'layout'>
): ImageSizePreset {
  if (attrs.layout === 'full-width') {
    return 'full-width';
  }
  if (!attrs.width) {
    return 'original';
  }
  for (const [preset, width] of Object.entries(IMAGE_SIZE_PRESET_WIDTHS) as [Exclude<ImageSizePreset, 'original' | 'full-width' | 'custom'>, number][]) {
    if (attrs.width === width) {
      return preset;
    }
  }
  return 'custom';
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

export const IMAGE_LAYOUT_LABELS: Record<ImageLayout, string> = {
  inline: 'Inline',
  'wrap-left': 'Wrap left',
  'wrap-right': 'Wrap right',
  'full-width': 'Full width'
};

export const IMAGE_SIZE_PRESET_LABELS: Record<ImageSizePreset, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  original: 'Original',
  'full-width': 'Full width',
  custom: 'Custom'
};
