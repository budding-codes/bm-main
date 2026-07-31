export type AccessibilityIssue = {
  id: string;
  severity: 'error' | 'warning';
  message: string;
};

/**
 * Lightweight client-side checks run while editing. These are guidance, not a
 * substitute for a full accessibility audit.
 */
export function analyzeAccessibility(doc: Record<string, unknown> | null | undefined): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  if (!doc || !Array.isArray(doc.content)) {
    return issues;
  }

  let previousHeadingLevel = 0;
  let imageIndex = 0;

  const walk = (node: Record<string, unknown>) => {
    const type = String(node.type || '');
    const attrs = (node.attrs || {}) as Record<string, unknown>;

    if (type === 'heading') {
      const level = Number(attrs.level) || 1;
      if (previousHeadingLevel && level > previousHeadingLevel + 1) {
        issues.push({
          id: `heading-skip-${issues.length}`,
          severity: 'warning',
          message: `Heading hierarchy jumps from H${previousHeadingLevel} to H${level}.`
        });
      }
      previousHeadingLevel = level;
    }

    if (type === 'image') {
      imageIndex += 1;
      const alt = String(attrs.alt || '').trim();
      if (!alt) {
        issues.push({
          id: `image-alt-${imageIndex}`,
          severity: 'error',
          message: `Image ${imageIndex} is missing alt text.`
        });
      }
    }

    if (type === 'youtube' || type === 'iframe') {
      const title = String(attrs.title || '').trim();
      if (!title) {
        issues.push({
          id: `embed-caption-${issues.length}`,
          severity: 'warning',
          message: 'An embedded media block has no accessible title/caption.'
        });
      }
    }

    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        if (child && typeof child === 'object') {
          walk(child as Record<string, unknown>);
        }
      }
    }
  };

  for (const child of doc.content) {
    if (child && typeof child === 'object') {
      walk(child as Record<string, unknown>);
    }
  }

  return issues;
}

export function analyzeSeo(input: {
  title: string;
  slug: string;
  metaDescription: string;
  contentText: string;
}) {
  const tips: string[] = [];
  const titleLength = input.title.trim().length;
  const metaLength = input.metaDescription.trim().length;

  if (titleLength === 0) tips.push('Add a title.');
  else if (titleLength < 30) tips.push('Title is short — aim for 30–60 characters.');
  else if (titleLength > 60) tips.push('Title may truncate in Google results (over 60 characters).');

  if (!input.slug) tips.push('Add a URL slug.');
  if (metaLength === 0) tips.push('Write a meta description.');
  else if (metaLength < 70) tips.push('Meta description is short — aim for 120–160 characters.');
  else if (metaLength > 160) tips.push('Meta description will be truncated past 160 characters.');

  if ((input.contentText || '').trim().split(/\s+/).filter(Boolean).length < 100) {
    tips.push('Body content is under 100 words — consider expanding for SEO.');
  }

  return tips;
}
