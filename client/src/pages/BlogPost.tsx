import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock3, Copy, Share2 } from 'lucide-react';
// @ts-expect-error react-helmet has no bundled types in this project
import { Helmet } from 'react-helmet';
import { apiUrl } from '../lib/api';
import { formatDate } from '../lib/format';
import { canonicalUrl } from '../lib/site';
import type { Blog } from '../types/blog';
import '../styles/bm-content.css';

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(apiUrl(`/api/blogs/${slug}`), {
          headers: { Accept: 'application/json' }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || 'Blog not found.');
        }
        if (mounted) {
          setBlog(data.blog);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load post.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    const updateProgress = () => {
      const el = document.documentElement;
      const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures.
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black px-6 py-24 text-center text-yellow-400">
        Loading article…
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-black px-6 py-24 text-center">
        <p className="text-red-400">{error || 'Blog not found.'}</p>
        <Link to="/blog" className="mt-6 inline-flex text-yellow-400 hover:text-yellow-300">
          Back to Blog
        </Link>
      </div>
    );
  }

  const bodyHtml =
    blog.contentHtml ||
    `<p>${String(blog.description || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')}</p>`;

  const pageCanonical = blog.seo?.canonicalUrl?.trim() || canonicalUrl(`/blog/${blog.slug}`);

  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <title>{`${blog.title} — Budding Mariners`}</title>
        <meta
          name="description"
          content={blog.seo?.metaDescription || blog.description}
        />
        {blog.seo?.noIndex ? <meta name="robots" content="noindex" /> : null}
        <link rel="canonical" href={pageCanonical} />
        <meta property="og:title" content={blog.seo?.metaTitle || blog.title} />
        <meta
          property="og:description"
          content={blog.seo?.metaDescription || blog.description}
        />
        <meta property="og:url" content={pageCanonical} />
        {(blog.seo?.ogImageUrl || blog.thumbnailUrl) ? (
          <meta property="og:image" content={blog.seo?.ogImageUrl || blog.thumbnailUrl} />
        ) : null}
      </Helmet>

      <div
        className="fixed left-0 top-0 z-50 h-1 bg-yellow-400 transition-all duration-100"
        style={{ width: `${readingProgress}%` }}
      />

      <article className="mx-auto max-w-3xl px-5 pb-20 pt-10 md:px-8">
        <Link
          to="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-yellow-300"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        {blog.thumbnailUrl ? (
          <img
            src={blog.thumbnailUrl}
            alt={blog.title}
            className="mb-8 h-64 w-full rounded-[24px] object-cover md:h-80"
            loading="lazy"
          />
        ) : null}

        <div className="mb-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
          {blog.featured ? (
            <span className="rounded-full bg-yellow-400 px-3 py-1 font-semibold text-black">
              Featured
            </span>
          ) : null}
          <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
          {blog.readingTimeMinutes ? (
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3 w-3" /> {blog.readingTimeMinutes} min read
            </span>
          ) : null}
        </div>

        <h1 className="text-3xl font-extrabold leading-tight text-white md:text-5xl">
          {blog.title}
        </h1>
        <p className="mt-4 text-sm text-white/55">By {blog.author}</p>

        {blog.tags && blog.tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div
          className="bm-blog-content mt-10"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        <div className="mt-12 flex flex-wrap gap-3 border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-yellow-400 hover:text-yellow-300"
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${blog.title} ${shareUrl}`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300"
          >
            <Share2 className="h-4 w-4" />
            Share on WhatsApp
          </a>
        </div>
      </article>
    </div>
  );
}
