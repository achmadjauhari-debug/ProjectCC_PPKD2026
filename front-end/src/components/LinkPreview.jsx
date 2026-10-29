import { ExternalLink, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLATFORMS } from '../constants.js';
import { youtubeId } from '../lib/media.js';

// Pratinjau tautan postingan. YouTube ditampilkan sebagai video tersemat;
// platform lain menampilkan tombol buka tautan (TikTok/IG/LinkedIn butuh script embed sendiri).
export default function LinkPreview({ url, platform }) {
  const value = (url || '').trim();
  if (!value) return null;

  let host = null;
  try { host = new URL(value).hostname; } catch { /* tautan belum valid */ }
  if (!host) {
    return (
      <div className="d-flex align-items-center gap-2 small text-secondary mb-3">
        <TriangleAlert size={16} /> Tautan belum valid. Awali dengan https://
      </div>
    );
  }

  const id = platform === 'youtube' ? youtubeId(value) : null;
  return (
    <div className="mb-3">
      {id ? (
        <div className="ratio ratio-16x9 rounded-3 overflow-hidden mb-2">
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            title="Pratinjau video YouTube"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : platform === 'youtube' ? (
        <div className="d-flex align-items-start gap-2 small text-secondary mb-2">
          <TriangleAlert size={16} className="flex-shrink-0 mt-1" />
          <span>Preview tidak tersedia: tautan YouTube harus ke sebuah video (contoh: youtube.com/watch?v=ID atau youtu.be/ID).</span>
        </div>
      ) : null}
      <Button asChild variant="outline" size="sm">
        <a href={value} target="_blank" rel="noopener noreferrer">
          <ExternalLink /> Buka di {PLATFORMS[platform] ?? host}
        </a>
      </Button>
    </div>
  );
}
