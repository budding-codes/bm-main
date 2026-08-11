export const GA_MEASUREMENT_ID = 'G-4W64E804KH';

export function trackPageView(pagePath: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, { page_path: pagePath });
  }
}
