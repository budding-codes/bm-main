import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, History, Images, RotateCcw, Save } from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';
import MediaPicker from '../components/MediaPicker';
import { RichEditor, type RichEditorHandle, type RichEditorUpdate } from '../../components/RichEditor';
import { adminFetch } from '../../lib/api';
import { analyzeAccessibility, analyzeSeo } from '../../lib/contentChecks';
import { formatDate } from '../../lib/format';
import { generateSlug } from '../../lib/slug';
import { renderBlogContentHtml, prepareContentBlocksForSave } from '../../lib/renderBlogContent';
import { BlogContent } from '../../components/BlogContent';
import type { Blog, BlogStatus } from '../../types/blog';
import type { MediaAsset } from '../../types/media';
import '../../styles/bm-content.css';

type PostSettings = {
  status: BlogStatus;
  featured: boolean;
  author: string;
  slug: string;
  metaDescription: string;
  tags: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  scheduledFor: string;
  expiresAt: string;
};

type RevisionSummary = {
  _id: string;
  revisionNumber: number;
  title: string;
  changeSummary?: string;
  createdAt: string;
  createdBy?: string;
  wordCount?: number;
};

const emptySettings: PostSettings = {
  status: 'draft',
  featured: false,
  author: 'BM Team',
  slug: '',
  metaDescription: '',
  tags: '',
  youtubeUrl: '',
  thumbnailUrl: '',
  scheduledFor: '',
  expiresAt: ''
};

const DRAFT_STORAGE_KEY = 'bm_editor_draft';

function toLocalInputValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function BlogEditorPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { token, handleUnauthorized } = useAdminAuth();

  const [title, setTitle] = useState('');
  const [settings, setSettings] = useState<PostSettings>(emptySettings);
  const [content, setContent] = useState<RichEditorUpdate>({
    html: '',
    json: { type: 'doc', content: [] },
    wordCount: 0,
    characterCount: 0
  });
  const [initialContent, setInitialContent] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'cover' | 'inline' | 'inline-replace'>('cover');
  const [pendingInlineInsert, setPendingInlineInsert] = useState<MediaAsset | null>(null);
  const [pendingInlineReplace, setPendingInlineReplace] = useState<MediaAsset | null>(null);
  const [revisions, setRevisions] = useState<RevisionSummary[]>([]);
  const [contentVersion, setContentVersion] = useState(0);
  const contentReady = useRef(false);
  const editorRef = useRef<RichEditorHandle>(null);
  const contentRef = useRef(content);
  contentRef.current = content;

  const loadRevisions = useCallback(async (blogId: string) => {
    try {
      const data = await adminFetch<{ revisions: RevisionSummary[] }>(
        `/api/admin/blogs/${blogId}/revisions`,
        { token, onUnauthorized: handleUnauthorized }
      );
      setRevisions(data.revisions || []);
    } catch {
      setRevisions([]);
    }
  }, [token, handleUnauthorized]);

  const loadBlog = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await adminFetch<{ blog: Blog }>(`/api/admin/blogs/${id}`, {
        token,
        onUnauthorized: handleUnauthorized
      });
      const blog = data.blog;
      const draftBlocks = blog.draft?.contentBlocks as Record<string, unknown> | null | undefined;
      const useDraft = Boolean(draftBlocks && blog.draft?.savedAt);

      setTitle(useDraft && blog.draft?.title ? blog.draft.title : blog.title);
      setSettings({
        status: blog.status || (blog.published ? 'published' : 'draft'),
        featured: blog.featured,
        author: blog.author || 'BM Team',
        slug: blog.slug || '',
        metaDescription: blog.seo?.metaDescription || '',
        tags: (blog.tags || []).join(', '),
        youtubeUrl: blog.youtubeUrl || '',
        thumbnailUrl: blog.thumbnailUrl || '',
        scheduledFor: toLocalInputValue(blog.scheduledFor),
        expiresAt: toLocalInputValue(blog.expiresAt)
      });
      setSlugTouched(Boolean(blog.slug));
      setInitialContent(useDraft ? draftBlocks || null : (blog.contentBlocks as Record<string, unknown>) || null);
      if (useDraft) {
        setMessage(`Recovered server draft from ${formatDate(blog.draft?.savedAt || '')}.`);
      }
      contentReady.current = true;
      await loadRevisions(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post.');
    } finally {
      setLoading(false);
    }
  }, [id, token, handleUnauthorized, loadRevisions]);

  useEffect(() => {
    if (isEditing) {
      void loadBlog();
    } else {
      try {
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (raw) {
          const draft = JSON.parse(raw) as {
            title?: string;
            settings?: PostSettings;
            content?: RichEditorUpdate;
          };
          if (draft.title) setTitle(draft.title);
          if (draft.settings) setSettings({ ...emptySettings, ...draft.settings });
          if (draft.content?.json) {
            setInitialContent(draft.content.json);
            setContent(draft.content);
          }
        }
      } catch {
        // Ignore corrupt local drafts.
      }
      contentReady.current = true;
    }
  }, [isEditing, loadBlog]);

  // Local + server autosave.
  useEffect(() => {
    if (!contentReady.current) return;
    if (!title && !contentRef.current.html) return;

    const timer = window.setInterval(() => {
      setAutoSaveStatus('saving');
      editorRef.current?.flushPendingChanges();
      const latestContent = editorRef.current?.getContent() || contentRef.current;
      const contentBlocks = prepareContentBlocksForSave(latestContent.json);
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            title,
            settings,
            content: latestContent,
            blogId: id || null,
            savedAt: new Date().toISOString()
          })
        );
      } catch {
        // Ignore quota errors.
      }

      if (id && contentBlocks) {
        void adminFetch(`/api/admin/blogs/${id}/draft`, {
          method: 'PUT',
          token,
          body: { title, contentBlocks },
          onUnauthorized: handleUnauthorized
        })
          .then(() => {
            setAutoSaveStatus('saved');
            window.setTimeout(() => setAutoSaveStatus('idle'), 2500);
          })
          .catch(() => setAutoSaveStatus('idle'));
      } else {
        setAutoSaveStatus('saved');
        window.setTimeout(() => setAutoSaveStatus('idle'), 2500);
      }
    }, 30000);

    return () => window.clearInterval(timer);
  }, [title, settings, id, token, handleUnauthorized]);

  const a11yIssues = useMemo(
    () => analyzeAccessibility(content.json),
    [content.json]
  );

  const seoTips = useMemo(
    () =>
      analyzeSeo({
        title,
        slug: settings.slug,
        metaDescription: settings.metaDescription,
        contentText: String((content.json as { content?: unknown }) ? content.html.replace(/<[^>]+>/g, ' ') : '')
      }),
    [title, settings.slug, settings.metaDescription, content.html, content.json]
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSettings((current) => ({ ...current, slug: generateSlug(value) }));
    }
  };

  const tagsArray = useMemo(
    () =>
      settings.tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    [settings.tags]
  );

  const previewHtml = useMemo(
    () => (preview ? renderBlogContentHtml(content.json) : ''),
    [preview, content.json]
  );

  const save = async (statusOverride?: BlogStatus) => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    editorRef.current?.flushPendingChanges();
    const latestContent = editorRef.current?.getContent() || content;
    setContent(latestContent);

    const status = statusOverride || settings.status;
    const contentBlocks = prepareContentBlocksForSave(latestContent.json);
    const payload = {
      title: title.trim(),
      author: settings.author.trim() || 'BM Team',
      slug: settings.slug.trim() || undefined,
      featured: settings.featured,
      status,
      published: status === 'published',
      youtubeUrl: settings.youtubeUrl.trim(),
      thumbnailUrl: settings.thumbnailUrl.trim(),
      tags: tagsArray,
      metaDescription: settings.metaDescription.trim(),
      scheduledFor: settings.scheduledFor ? new Date(settings.scheduledFor).toISOString() : null,
      expiresAt: settings.expiresAt ? new Date(settings.expiresAt).toISOString() : null,
      contentBlocks
    };

    try {
      const data = await adminFetch<{ blog: Blog }>(
        isEditing ? `/api/admin/blogs/${id}` : '/api/admin/blogs',
        {
          method: isEditing ? 'PUT' : 'POST',
          token,
          body: payload,
          onUnauthorized: handleUnauthorized
        }
      );

      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setMessage(status === 'published' ? 'Published.' : 'Saved as draft.');
      setSettings((current) => ({
        ...current,
        status,
        slug: data.blog.slug || current.slug
      }));

      if (!isEditing && data.blog._id) {
        navigate(`/admin/blogs/${data.blog._id}/edit`, { replace: true });
      } else if (id) {
        await loadRevisions(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post.');
    } finally {
      setSaving(false);
    }
  };

  const restoreRevision = async (revisionNumber: number) => {
    if (!id) return;
    if (!window.confirm(`Restore revision #${revisionNumber}? Current content will be kept in history.`)) {
      return;
    }

    try {
      const data = await adminFetch<{ blog: Blog }>(
        `/api/admin/blogs/${id}/revisions/${revisionNumber}/restore`,
        { method: 'POST', token, body: {}, onUnauthorized: handleUnauthorized }
      );
      setMessage(`Restored revision #${revisionNumber}.`);
      setTitle(data.blog.title);
      setInitialContent((data.blog.contentBlocks as Record<string, unknown>) || null);
      setContent((current) => ({
        ...current,
        html: data.blog.contentHtml || '',
        json: (data.blog.contentBlocks as Record<string, unknown>) || current.json,
        wordCount: data.blog.wordCount || 0
      }));
      setContentVersion((value) => value + 1);
      await loadRevisions(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore revision.');
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-yellow-400">Loading editor...</div>;
  }

  const handlePreviewToggle = () => {
    if (!preview) {
      editorRef.current?.flushPendingChanges();
      const latest = editorRef.current?.getContent();
      if (latest) {
        setContent(latest);
      }
    }
    setPreview((value) => !value);
  };

  const previewTitle = title || 'Untitled post';
  const previewUrl = `buddingmariners.com/blog/${settings.slug || 'your-slug'}`;
  const previewDescription =
    settings.metaDescription ||
    content.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) ||
    'Meta description preview will appear here.';

  return (
    <form
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        void save();
      }}
      className="mx-auto max-w-[1400px]"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/blogs"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <h1 className="text-xl font-bold text-yellow-400">
              {isEditing ? 'Edit Post' : 'New Post'}
            </h1>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">
              {autoSaveStatus === 'saving'
                ? 'Saving draft…'
                : autoSaveStatus === 'saved'
                  ? 'Draft saved'
                  : `${content.wordCount} words`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePreviewToggle}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-yellow-400/40 hover:text-yellow-300"
          >
            <Eye className="h-4 w-4" />
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save('draft')}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            Save draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save('published')}
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-60"
          >
            Publish
          </button>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
      {message ? <p className="mb-4 text-sm text-emerald-400">{message}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Post title…"
            className="w-full border-0 bg-transparent text-3xl font-extrabold text-white outline-none placeholder:text-white/25 md:text-4xl"
            required
          />

          <div className={preview ? 'hidden' : undefined} aria-hidden={preview}>
            <RichEditor
              ref={editorRef}
              key={`${id || 'new'}-${contentVersion}`}
              initialContent={initialContent}
              token={token}
              onUnauthorized={handleUnauthorized}
              onUpdate={setContent}
              pendingImage={
                pendingInlineReplace
                  ? { asset: pendingInlineReplace, mode: 'replace' }
                  : pendingInlineInsert
              }
              onPendingImageConsumed={() => {
                setPendingInlineInsert(null);
                setPendingInlineReplace(null);
              }}
              onRequestMediaLibrary={() => {
                setMediaPickerTarget('inline');
                setMediaPickerOpen(true);
              }}
              onRequestImageReplace={() => {
                setMediaPickerTarget('inline-replace');
                setMediaPickerOpen(true);
              }}
            />
          </div>

          {preview ? (
            <BlogContent
              html={previewHtml || '<p class="text-white/40">Nothing to preview yet.</p>'}
              className="rounded-xl border border-white/10 bg-[#0d0d0d] p-8"
            />
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/10 bg-[#18181b] p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-yellow-400">
              Post settings
            </h2>
            <div className="space-y-3">
              <label className="block text-xs text-white/50">
                Status
                <select
                  value={settings.status}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      status: event.target.value as BlogStatus
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </label>

              {settings.status === 'scheduled' ? (
                <label className="block text-xs text-white/50">
                  Publish at
                  <input
                    type="datetime-local"
                    value={settings.scheduledFor}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, scheduledFor: event.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                  />
                </label>
              ) : null}

              <label className="block text-xs text-white/50">
                Expires at (optional)
                <input
                  type="datetime-local"
                  value={settings.expiresAt}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, expiresAt: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                />
              </label>

              <label className="block text-xs text-white/50">
                Author
                <input
                  type="text"
                  value={settings.author}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, author: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                />
              </label>

              <label className="block text-xs text-white/50">
                Slug
                <div className="mt-1 flex items-center gap-1 rounded-xl border border-white/10 bg-black px-3 py-2">
                  <span className="text-xs text-white/35">/blog/</span>
                  <input
                    type="text"
                    value={settings.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      setSettings((current) => ({
                        ...current,
                        slug: generateSlug(event.target.value)
                      }));
                    }}
                    className="w-full bg-transparent text-sm text-white outline-none"
                  />
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black px-3 py-3 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={settings.featured}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, featured: event.target.checked }))
                  }
                  className="h-4 w-4 accent-yellow-400"
                />
                Featured post
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#18181b] p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-yellow-400">
              Featured media
            </h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setMediaPickerTarget('cover');
                  setMediaPickerOpen(true);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-black px-3 py-3 text-sm font-semibold text-white/70 transition hover:border-yellow-400/40 hover:text-yellow-300"
              >
                <Images className="h-4 w-4" />
                {settings.thumbnailUrl ? 'Change cover image' : 'Choose cover image'}
              </button>
              <input
                type="url"
                value={settings.thumbnailUrl}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, thumbnailUrl: event.target.value }))
                }
                placeholder="Or paste thumbnail URL"
                className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
              />
              <input
                type="url"
                value={settings.youtubeUrl}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, youtubeUrl: event.target.value }))
                }
                placeholder="YouTube URL (optional)"
                className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
              />
              {settings.thumbnailUrl ? (
                <img
                  src={settings.thumbnailUrl}
                  alt="Featured preview"
                  className="h-36 w-full rounded-xl object-cover"
                />
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#18181b] p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-yellow-400">SEO</h2>
            <div className="mb-3 rounded-xl border border-white/10 bg-white p-3 text-black">
              <p className="truncate text-sm text-[#1a0dab]">{previewTitle}</p>
              <p className="truncate text-xs text-[#006621]">{previewUrl}</p>
              <p className="mt-1 line-clamp-2 text-xs text-[#4d5156]">{previewDescription}</p>
            </div>
            <div className="space-y-3">
              <label className="block text-xs text-white/50">
                Meta description
                <textarea
                  value={settings.metaDescription}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      metaDescription: event.target.value.slice(0, 160)
                    }))
                  }
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                />
                <span className="mt-1 block text-right text-[11px] text-white/35">
                  {settings.metaDescription.length}/160
                </span>
              </label>
              <label className="block text-xs text-white/50">
                Tags (comma separated)
                <input
                  type="text"
                  value={settings.tags}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, tags: event.target.value }))
                  }
                  placeholder="maritime, career, imu"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                />
              </label>
              {seoTips.length > 0 ? (
                <ul className="space-y-1 text-xs text-amber-200/80">
                  {seoTips.map((tip) => (
                    <li key={tip}>• {tip}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-300/80">SEO looks solid.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#18181b] p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-yellow-400">
              Accessibility
            </h2>
            {a11yIssues.length === 0 ? (
              <p className="text-xs text-emerald-300/80">No accessibility issues detected.</p>
            ) : (
              <ul className="space-y-2">
                {a11yIssues.map((issue) => (
                  <li
                    key={issue.id}
                    className={`rounded-lg px-3 py-2 text-xs ${
                      issue.severity === 'error'
                        ? 'bg-red-500/10 text-red-300'
                        : 'bg-amber-400/10 text-amber-200'
                    }`}
                  >
                    {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {isEditing ? (
            <section className="rounded-2xl border border-white/10 bg-[#18181b] p-4">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-yellow-400">
                <History className="h-3.5 w-3.5" /> Revisions
              </h2>
              {revisions.length === 0 ? (
                <p className="text-xs text-white/45">No revisions yet.</p>
              ) : (
                <ul className="space-y-2">
                  {revisions.slice(0, 8).map((revision) => (
                    <li
                      key={revision._id}
                      className="rounded-xl border border-white/10 bg-black px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-white">
                            #{revision.revisionNumber} · {revision.changeSummary || 'Update'}
                          </p>
                          <p className="mt-1 text-[11px] text-white/40">
                            {formatDate(revision.createdAt)}
                            {revision.createdBy ? ` · ${revision.createdBy}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void restoreRevision(revision.revisionNumber)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[11px] font-semibold text-white/70 hover:border-yellow-400 hover:text-yellow-300"
                        >
                          <RotateCcw className="h-3 w-3" /> Restore
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </aside>
      </div>

      <MediaPicker
        open={mediaPickerOpen}
        title={
          mediaPickerTarget === 'cover'
            ? 'Choose cover image'
            : mediaPickerTarget === 'inline-replace'
              ? 'Replace image'
              : 'Insert image'
        }
        selectableKinds={['image']}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(asset) => {
          if (mediaPickerTarget === 'cover') {
            setSettings((current) => ({ ...current, thumbnailUrl: asset.url }));
          } else if (mediaPickerTarget === 'inline-replace') {
            setPendingInlineReplace(asset);
          } else {
            setPendingInlineInsert(asset);
          }
        }}
      />
    </form>
  );
}
