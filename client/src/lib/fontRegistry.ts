/**
 * Browser-safe font registry for blog rich-text content.
 *
 * Font definitions are loaded from shared/content/fontRegistry.data.json.
 * Server-side logic mirrors this file in shared/content/fontRegistry.js.
 */
import fontRegistryData from '@shared/content/fontRegistry.data.json';

export type FontCategory = 'sans-serif' | 'serif' | 'system';

export type GoogleFontConfig = {
  family: string;
  weights: number[];
};

export type FontDefinition = {
  id: string;
  label: string;
  category: FontCategory;
  featured?: boolean;
  cssFamily: string;
  googleFont?: GoogleFontConfig;
  isSystem?: boolean;
};

export const FONT_REGISTRY = fontRegistryData as FontDefinition[];

const FONT_BY_ID = new Map(FONT_REGISTRY.map((font) => [font.id, font]));
export const FONT_IDS = new Set(FONT_REGISTRY.map((font) => font.id));
export const FONT_CLASS_PREFIX = 'bm-font-';

/** Default body typography — matches `.bm-blog-content` in bm-content.css. */
export const DEFAULT_BODY_FONT_ID = 'georgia';

export function isValidFontId(value: unknown): value is string {
  return typeof value === 'string' && FONT_IDS.has(value);
}

export function normalizeFontId(value: unknown): string | null {
  return isValidFontId(value) ? value : null;
}

export function getFontById(id: string): FontDefinition | null {
  return FONT_BY_ID.get(id) || null;
}

export function getFontCssClass(id: string): string | null {
  return isValidFontId(id) ? `${FONT_CLASS_PREFIX}${id}` : null;
}

export function getFeaturedFonts(): FontDefinition[] {
  return FONT_REGISTRY.filter((font) => font.featured);
}

export function getFontsByCategory(category: FontCategory): FontDefinition[] {
  return FONT_REGISTRY.filter((font) => font.category === category);
}

function getGoogleFontFamilies(fontIds: string[]) {
  const families: Array<{ family: string; weights: number[] }> = [];

  for (const id of fontIds) {
    const font = getFontById(id);
    if (font?.googleFont) {
      const weights = [...new Set(font.googleFont.weights)].sort((a, b) => a - b);
      families.push({
        family: font.googleFont.family,
        weights
      });
    }
  }

  return families;
}

export function buildGoogleFontsUrl(fontIds: string[]): string | null {
  const families = getGoogleFontFamilies(fontIds);
  if (families.length === 0) {
    return null;
  }

  const params = families.map(({ family, weights }) => {
    const encoded = encodeURIComponent(family);
    return `family=${encoded}:wght@${weights.join(';')}`;
  });

  return `https://fonts.googleapis.com/css2?${params.join('&')}&display=swap`;
}

export function buildEditorPreviewFontsUrl(): string | null {
  const googleIds = FONT_REGISTRY.filter((font) => font.googleFont).map((font) => font.id);
  return buildGoogleFontsUrl(googleIds);
}

const FONT_ID_HTML_PATTERN = /data-font="([^"]+)"|class="[^"]*\bbm-font-([a-z0-9-]+)\b/g;

export function extractFontIdsFromHtml(html: string): string[] {
  if (typeof html !== 'string' || !html) {
    return [];
  }

  const found = new Set<string>();
  let match = FONT_ID_HTML_PATTERN.exec(html);
  while (match) {
    const id = normalizeFontId(match[1] || match[2]);
    if (id) {
      found.add(id);
    }
    match = FONT_ID_HTML_PATTERN.exec(html);
  }

  return [...found];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function extractFontIdsFromDoc(node: Record<string, unknown>): string[] {
  const found = new Set<string>();
  walkDocForFonts(node, found);
  return [...found];
}

function walkDocForFonts(node: Record<string, unknown>, found: Set<string>) {
  if (!isPlainObject(node)) {
    return;
  }

  if (Array.isArray(node.marks)) {
    for (const mark of node.marks) {
      if (
        isPlainObject(mark) &&
        mark.type === 'fontFamily' &&
        isValidFontId((mark.attrs as { fontId?: string } | undefined)?.fontId)
      ) {
        found.add((mark.attrs as { fontId: string }).fontId);
      }
    }
  }

  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      if (isPlainObject(child)) {
        walkDocForFonts(child, found);
      }
    }
  }
}

/**
 * Walks a Tiptap document and strips or normalizes invalid fontFamily marks.
 * If multiple fontFamily marks were stacked (legacy excludes:'' bug), keep only
 * the last valid one so save/render matches the latest user selection.
 */
export function normalizeDocumentFonts(node: Record<string, unknown>): Record<string, unknown> {
  if (!isPlainObject(node)) {
    return node;
  }

  const next: Record<string, unknown> = { ...node };

  if (Array.isArray(node.marks)) {
    const kept: unknown[] = [];
    let lastFontFamily: Record<string, unknown> | null = null;

    for (const mark of node.marks) {
      if (!isPlainObject(mark) || mark.type !== 'fontFamily') {
        kept.push(mark);
        continue;
      }

      const fontId = normalizeFontId((mark.attrs as { fontId?: string } | undefined)?.fontId);
      if (!fontId) {
        continue;
      }

      lastFontFamily = { ...mark, attrs: { fontId } };
    }

    if (lastFontFamily) {
      kept.push(lastFontFamily);
    }

    next.marks = kept;
  }

  if (Array.isArray(node.content)) {
    next.content = node.content.map((child) =>
      isPlainObject(child) ? normalizeDocumentFonts(child) : child
    );
  }

  return next;
}
