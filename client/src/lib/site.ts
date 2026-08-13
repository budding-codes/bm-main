/**
 * Canonical public origin. Must match live production: apex
 * buddingmariners.com 301s to www. Keep in sync with server/src/seo/site.js.
 */
export const SITE_ORIGIN = 'https://www.buddingmariners.com';

export function canonicalUrl(path = '/'): string {
  if (!path || path === '/') {
    return `${SITE_ORIGIN}/`;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized.replace(/\/+$/, '')}`;
}
