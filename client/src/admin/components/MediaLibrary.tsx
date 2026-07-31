import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image as ImageIcon, Search, Trash2, Upload, X } from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext';
import { adminFetch } from '../../lib/api';
import { buildDeliveryUrl } from '../../lib/cloudinaryUrl';
import { formatBytes, formatDate } from '../../lib/format';
import type { MediaAsset, MediaKind, MediaListResponse } from '../../types/media';

const KIND_FILTERS: Array<{ value: '' | MediaKind; label: string }> = [
  { value: '', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Documents' }
];

type MediaLibraryProps = {
  /** When set, the library acts as a picker and calls this on selection. */
  onSelect?: (asset: MediaAsset) => void;
  selectableKinds?: MediaKind[];
  className?: string;
};

export default function MediaLibrary({ onSelect, selectableKinds, className = '' }: MediaLibraryProps) {
  const { token, handleUnauthorized } = useAdminAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<'' | MediaKind>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<MediaAsset | null>(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '24' });
      if (kind) params.set('kind', kind);
      if (search.trim()) params.set('search', search.trim());

      const data = await adminFetch<MediaListResponse>(`/api/admin/media?${params}`, {
        token,
        onUnauthorized: handleUnauthorized
      });

      setAssets(data.assets || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setAssets([]);
      setError(err instanceof Error ? err.message : 'Failed to load media.');
    } finally {
      setLoading(false);
    }
  }, [token, handleUnauthorized, page, kind, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAssets();
    }, search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [loadAssets, search]);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    setError('');
    setMessage('');

    try {
      if (list.length === 1) {
        const formData = new FormData();
        formData.append('file', list[0]);
        await adminFetch('/api/admin/media', {
          method: 'POST',
          token,
          body: formData,
          onUnauthorized: handleUnauthorized
        });
      } else {
        const formData = new FormData();
        list.forEach((file) => formData.append('files', file));
        await adminFetch('/api/admin/media/batch', {
          method: 'POST',
          token,
          body: formData,
          onUnauthorized: handleUnauthorized
        });
      }

      setMessage(`${list.length} file(s) uploaded.`);
      setPage(1);
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const deleteAsset = async (asset: MediaAsset) => {
    if (!window.confirm(`Delete "${asset.displayName || asset.originalFilename}"?`)) {
      return;
    }

    try {
      await adminFetch(`/api/admin/media/${asset._id}`, {
        method: 'DELETE',
        token,
        onUnauthorized: handleUnauthorized
      });
      setSelected(null);
      setMessage('Asset deleted.');
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const saveMetadata = async () => {
    if (!selected) return;
    try {
      const data = await adminFetch<{ asset: MediaAsset }>(`/api/admin/media/${selected._id}`, {
        method: 'PATCH',
        token,
        body: {
          displayName: selected.displayName,
          alt: selected.alt,
          caption: selected.caption,
          tags: selected.tags
        },
        onUnauthorized: handleUnauthorized
      });
      setSelected(data.asset);
      setAssets((current) => current.map((item) => (item._id === data.asset._id ? data.asset : item)));
      setMessage('Metadata saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save metadata.');
    }
  };

  const visibleKinds = useMemo(() => {
    if (!selectableKinds?.length) return KIND_FILTERS;
    return KIND_FILTERS.filter((item) => !item.value || selectableKinds.includes(item.value));
  }, [selectableKinds]);

  const previewUrl = (asset: MediaAsset) => {
    if (asset.kind !== 'image') return asset.url;
    return (
      buildDeliveryUrl(asset.publicId, { width: 400, height: 300, crop: 'fill' }) || asset.url
    );
  };

  return (
    <div className={className}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search assets…"
              className="w-full rounded-xl border border-white/10 bg-black py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-yellow-400"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {visibleKinds.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setPage(1);
                  setKind(item.value);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  kind === item.value
                    ? 'bg-yellow-400 text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
          hidden
          onChange={(event) => {
            if (event.target.files) {
              void uploadFiles(event.target.files);
            }
            event.target.value = '';
          }}
        />
      </div>

      {error ? <p className="mb-3 text-sm text-red-400">{error}</p> : null}
      {message ? <p className="mb-3 text-sm text-emerald-400">{message}</p> : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {loading ? (
            <div className="py-16 text-center text-yellow-400">Loading media…</div>
          ) : assets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center">
              <ImageIcon className="mx-auto mb-3 h-8 w-8 text-yellow-400/70" />
              <p className="text-sm text-white/55">No assets yet. Upload your first file.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {assets.map((asset) => {
                const isSelected = selected?._id === asset._id;
                return (
                  <button
                    key={asset._id}
                    type="button"
                    onClick={() => setSelected(asset)}
                    onDoubleClick={() => onSelect?.(asset)}
                    className={`overflow-hidden rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-yellow-400 ring-1 ring-yellow-400'
                        : 'border-white/10 hover:border-yellow-400/40'
                    }`}
                  >
                    <div className="aspect-[4/3] bg-[#111]">
                      {asset.kind === 'image' ? (
                        <img
                          src={previewUrl(asset)}
                          alt={asset.alt || asset.displayName || ''}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-white/40">
                          {asset.kind}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 p-2.5">
                      <p className="truncate text-xs font-semibold text-white">
                        {asset.displayName || asset.originalFilename || asset.publicId}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">
                        {formatBytes(asset.bytes)}
                        {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ''}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded bg-yellow-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-white/50">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                className="rounded bg-yellow-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>

        <aside className="rounded-2xl border border-white/10 bg-[#18181b] p-4">
          {!selected ? (
            <p className="text-sm text-white/45">Select an asset to view details.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-bold text-yellow-400">Details</h2>
                <button type="button" onClick={() => setSelected(null)} className="text-white/40 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {selected.kind === 'image' ? (
                <img
                  src={previewUrl(selected)}
                  alt={selected.alt || ''}
                  className="h-40 w-full rounded-xl object-cover"
                />
              ) : null}

              <p className="break-all text-xs text-white/40">{selected.publicId}</p>
              <p className="text-xs text-white/50">
                {formatDate(selected.createdAt)} · {formatBytes(selected.bytes)}
                {selected.width ? ` · ${selected.width}×${selected.height}` : ''}
                {typeof selected.usageCount === 'number' ? ` · used in ${selected.usageCount}` : ''}
              </p>

              <label className="block text-xs text-white/50">
                Display name
                <input
                  value={selected.displayName || ''}
                  onChange={(event) =>
                    setSelected((current) =>
                      current ? { ...current, displayName: event.target.value } : current
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                />
              </label>

              <label className="block text-xs text-white/50">
                Alt text
                <input
                  value={selected.alt || ''}
                  onChange={(event) =>
                    setSelected((current) =>
                      current ? { ...current, alt: event.target.value } : current
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                />
              </label>

              <label className="block text-xs text-white/50">
                Caption
                <textarea
                  value={selected.caption || ''}
                  onChange={(event) =>
                    setSelected((current) =>
                      current ? { ...current, caption: event.target.value } : current
                    )
                  }
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void saveMetadata()}
                  className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-semibold text-black"
                >
                  Save
                </button>
                {onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(selected)}
                    className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Use this asset
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void deleteAsset(selected)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
