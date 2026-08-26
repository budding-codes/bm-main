import { useEffect } from 'react';
import { buildGoogleFontsUrl, extractFontIdsFromHtml } from '../lib/fontRegistry';

const BLOG_FONTS_LINK_ID = 'bm-blog-fonts';

type BlogFontLoaderProps = {
  html: string;
};

/**
 * Loads only the Google Fonts referenced in rendered blog HTML.
 * System fonts need no network request.
 */
export function BlogFontLoader({ html }: BlogFontLoaderProps) {
  useEffect(() => {
    const fontIds = extractFontIdsFromHtml(html);
    const href = buildGoogleFontsUrl(fontIds);

    const existing = document.getElementById(BLOG_FONTS_LINK_ID) as HTMLLinkElement | null;

    if (!href) {
      existing?.remove();
      return;
    }

    if (existing) {
      if (existing.href !== href) {
        existing.href = href;
      }
      return;
    }

    const link = document.createElement('link');
    link.id = BLOG_FONTS_LINK_ID;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }, [html]);

  return null;
}
