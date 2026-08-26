/**
 * Link URL validation for the blog editor.
 * Mirrors shared/content/linkUtils.js — keep both files in sync.
 */

const BLOCKED_SCHEME_PATTERN = /^(javascript|data|vbscript|file|blob):/i;
const ALLOWED_ABSOLUTE_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const DOMAIN_LIKE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+(?::\d+)?(?:\/[^\s]*)?$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LinkValidationResult = {
  valid: boolean;
  url: string | null;
  error: string | null;
};

function trimInput(value: string): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function hasBlockedScheme(value: string): boolean {
  return BLOCKED_SCHEME_PATTERN.test(trimInput(value));
}

export function isHashLink(value: string): boolean {
  const trimmed = trimInput(value);
  return trimmed.startsWith('#') && trimmed.length > 1 && !trimmed.includes(' ');
}

export function isRelativePath(value: string): boolean {
  const trimmed = trimInput(value);
  return trimmed.startsWith('/') && !trimmed.startsWith('//');
}

export function isExternalLink(href: string): boolean {
  const trimmed = trimInput(href);
  if (!trimmed) {
    return false;
  }
  if (isRelativePath(trimmed) || isHashLink(trimmed)) {
    return false;
  }
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function buildLinkHtmlAttributes(href: string): Record<string, string> | null {
  const sanitized = sanitizeLinkUrl(href);
  if (!sanitized) {
    return null;
  }

  const attrs: Record<string, string> = {
    href: sanitized,
    class: 'bm-content-link'
  };

  if (isExternalLink(sanitized)) {
    attrs.target = '_blank';
    attrs.rel = 'noopener noreferrer nofollow';
  }

  return attrs;
}

export function sanitizeLinkUrl(input: string): string | null {
  const raw = trimInput(input);
  if (!raw) {
    return null;
  }

  if (hasBlockedScheme(raw) || raw.includes('\0')) {
    return null;
  }

  if (isHashLink(raw)) {
    return raw;
  }

  if (isRelativePath(raw)) {
    if (raw.includes('//') || /[<>"']/.test(raw)) {
      return null;
    }
    return raw;
  }

  if (raw.startsWith('//')) {
    return null;
  }

  if (raw.startsWith('mailto:')) {
    const address = raw.slice('mailto:'.length).split('?')[0].trim();
    if (!address || /[<>"']/.test(address)) {
      return null;
    }
    return `mailto:${address}`;
  }

  if (raw.startsWith('tel:')) {
    const number = raw.slice('tel:'.length).replace(/[^\d+().\-\s]/g, '').trim();
    if (!number) {
      return null;
    }
    return `tel:${number}`;
  }

  let candidate = raw;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(candidate)) {
    if (EMAIL_PATTERN.test(candidate)) {
      candidate = `mailto:${candidate}`;
    } else if (DOMAIN_LIKE_PATTERN.test(candidate)) {
      candidate = `https://${candidate}`;
    } else {
      return null;
    }
  }

  try {
    const parsed = new URL(candidate);
    if (!ALLOWED_ABSOLUTE_SCHEMES.has(parsed.protocol)) {
      return null;
    }
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      if (!parsed.hostname) {
        return null;
      }
      return parsed.toString();
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function validateLinkUrl(input: string): LinkValidationResult {
  const sanitized = sanitizeLinkUrl(input);
  if (sanitized) {
    return { valid: true, url: sanitized, error: null };
  }

  const raw = trimInput(input);
  if (!raw) {
    return { valid: false, url: null, error: 'Enter a URL to create a link.' };
  }

  if (hasBlockedScheme(raw)) {
    return { valid: false, url: null, error: 'This URL uses an unsupported or unsafe protocol.' };
  }

  return {
    valid: false,
    url: null,
    error: 'Enter a valid URL (https://, /page, mailto:, tel:, or #anchor).'
  };
}
