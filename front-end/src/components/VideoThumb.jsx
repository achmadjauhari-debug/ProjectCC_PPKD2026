import { Play } from 'lucide-react';
import { youtubeId } from '../lib/media.js';

// Thumbnail video untuk kartu pipeline. Pakai <img>, bukan <iframe>:
// ringan, tidak menangkap klik, dan valid di dalam <button>.
export default function VideoThumb({ url, platform }) {
  const id = platform === 'youtube' && url ? youtubeId(url) : null;
  if (!id) return null;
  return (
    <span className="ratio ratio-16x9 d-block rounded-2 overflow-hidden mt-2 bg-body-secondary">
      <img
        src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`}
        alt=""
        loading="lazy"
        className="object-fit-cover"
        onError={(e) => { e.currentTarget.style.display = 'none'; }} // video privat/dihapus
      />
      <span className="d-flex align-items-center justify-content-center">
        <span className="d-flex rounded-circle bg-dark bg-opacity-50 text-white p-2">
          <Play size={16} fill="currentColor" />
        </span>
      </span>
    </span>
  );
}
