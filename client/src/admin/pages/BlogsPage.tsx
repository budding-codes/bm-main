import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PencilLine, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';
import { adminFetch } from '../../lib/api';
import { formatDate } from '../../lib/format';
import type { Blog } from '../../types/blog';

export default function BlogsPage() {
  const { token, handleUnauthorized } = useAdminAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminFetch<{ blogs: Blog[] }>('/api/admin/blogs', {
        token,
        onUnauthorized: handleUnauthorized
      });
      setBlogs(data.blogs || []);
    } catch {
      setBlogs([]);
      setError('Unable to load blogs right now.');
    } finally {
      setLoading(false);
    }
  }, [token, handleUnauthorized]);

  useEffect(() => {
    void fetchBlogs();
  }, [fetchBlogs]);

  const togglePublished = async (blog: Blog) => {
    try {
      const nextPublished = !blog.published;
      const data = await adminFetch<{ blog: Blog }>(`/api/admin/blogs/${blog._id}`, {
        method: 'PATCH',
        token,
        body: { published: nextPublished },
        onUnauthorized: handleUnauthorized
      });
      setBlogs((current) =>
        current.map((item) => (item._id === blog._id ? data.blog : item))
      );
      setMessage(nextPublished ? 'Post published.' : 'Post set to draft.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  const deleteBlog = async (id: string) => {
    if (!window.confirm('Delete this blog post?')) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await adminFetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
        token,
        onUnauthorized: handleUnauthorized
      });
      setBlogs((current) => current.filter((blog) => blog._id !== id));
      setMessage('Blog deleted.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">Blogs</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/40">
            Manage published posts and drafts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void fetchBlogs()}
            className="inline-flex items-center gap-2 rounded bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/15"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
          <Link
            to="/admin/blogs/new"
            className="inline-flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 font-semibold text-black transition hover:bg-yellow-300"
          >
            <Plus className="h-4 w-4" /> New Post
          </Link>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
      {message ? <p className="mb-4 text-sm text-emerald-400">{message}</p> : null}

      {loading ? (
        <div className="text-center text-yellow-400">Loading blogs...</div>
      ) : blogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-white/55">
          No blogs yet. Create your first post with the rich editor.
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <article key={blog._id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#18181b]">
              <div className="grid gap-0 md:grid-cols-[180px_minmax(0,1fr)]">
                <div className="min-h-[160px] bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.25),_transparent_35%),linear-gradient(135deg,_#111827_0%,_#111111_100%)]">
                  {blog.thumbnailUrl ? (
                    <img src={blog.thumbnailUrl} alt={blog.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-end p-4 text-sm font-semibold text-yellow-200">
                      No thumbnail
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
                        {blog.featured ? (
                          <span className="rounded-full bg-yellow-400 px-3 py-1 font-semibold text-black">
                            Featured
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full px-3 py-1 font-semibold ${
                            blog.published
                              ? 'bg-emerald-400/15 text-emerald-300'
                              : 'bg-white/10 text-white/60'
                          }`}
                        >
                          {blog.status || (blog.published ? 'Published' : 'Draft')}
                        </span>
                        <span>{formatDate(blog.createdAt)}</span>
                        {blog.readingTimeMinutes ? <span>{blog.readingTimeMinutes} min read</span> : null}
                      </div>
                      <h3 className="text-xl font-bold text-white">{blog.title}</h3>
                      <p className="mt-2 text-sm text-white/65">By {blog.author}</p>
                      {blog.slug ? (
                        <p className="mt-1 text-xs text-white/40">/blog/{blog.slug}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void togglePublished(blog)}
                        className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white/70 transition hover:border-yellow-400 hover:text-yellow-300"
                      >
                        {blog.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <Link
                        to={`/admin/blogs/${blog._id}/edit`}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white/70 transition hover:border-yellow-400 hover:text-yellow-300"
                      >
                        <PencilLine className="h-4 w-4" /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => void deleteBlog(blog._id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-4 text-sm leading-7 text-white/65">{blog.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
