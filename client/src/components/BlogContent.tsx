type BlogContentProps = {
  html: string;
  className?: string;
};

/**
 * Canonical public/preview article body renderer.
 * Uses `bm-blog-content` styles only — never editor chrome classes such as
 * `bm-rich-editor`, which apply flex layout and break floated image wrapping.
 */
export function BlogContent({ html, className }: BlogContentProps) {
  return (
    <div
      lang="en"
      className={['bm-blog-content', className].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
