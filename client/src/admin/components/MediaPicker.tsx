import { useState } from 'react';
import { Upload, Images, X } from 'lucide-react';
import MediaLibrary from './MediaLibrary';
import { adminFetch } from '../../lib/api';
import { useAdminAuth } from '../AdminAuthContext';
import type { MediaAsset, MediaKind } from '../../types/media';

type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  selectableKinds?: MediaKind[];
  title?: string;
};

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  selectableKinds = ['image'],
  title = 'Choose media'
}: MediaPickerProps) {
  const { token, handleUnauthorized } = useAdminAuth();
  const [mode, setMode] = useState<'choose' | 'upload'>('choose');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await adminFetch<{ asset: MediaAsset }>('/api/admin/media', {
        method: 'POST',
        token,
        body: formData,
        onUnauthorized: handleUnauthorized
      });
      onSelect(data.asset);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-yellow-400">{title}</h2>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setMode('choose')}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  mode === 'choose' ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white/70'
                }`}
              >
                <Images className="h-3.5 w-3.5" /> Choose Existing
              </button>
              <button
                type="button"
                onClick={() => setMode('upload')}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  mode === 'upload' ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white/70'
                }`}
              >
                <Upload className="h-3.5 w-3.5" /> Upload New
              </button>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {error ? <p className="mb-3 text-sm text-red-400">{error}</p> : null}

          {mode === 'choose' ? (
            <MediaLibrary
              selectableKinds={selectableKinds}
              onSelect={(asset) => {
                onSelect(asset);
                onClose();
              }}
            />
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-20 text-center transition hover:border-yellow-400/40">
              <Upload className="mb-3 h-8 w-8 text-yellow-400" />
              <p className="text-sm font-semibold text-white">
                {uploading ? 'Uploading…' : 'Drop a file or click to upload'}
              </p>
              <p className="mt-1 text-xs text-white/40">Images, video, audio, or documents</p>
              <input
                type="file"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                hidden
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleUpload(file);
                  event.target.value = '';
                }}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
