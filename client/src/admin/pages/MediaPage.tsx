import MediaLibrary from '../components/MediaLibrary';

export default function MediaPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">Media Library</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/40">
          Browse, search, and reuse uploaded assets
        </p>
      </div>
      <MediaLibrary />
    </div>
  );
}
