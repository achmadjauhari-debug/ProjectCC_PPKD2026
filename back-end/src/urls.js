const HOSTS = {
  youtube: ['youtube.com', 'youtu.be'],
  tiktok: ['tiktok.com'],
  instagram: ['instagram.com'],
  linkedin: ['linkedin.com'],
};

// Ambil ID video (11 karakter) dari berbagai bentuk tautan YouTube; null jika bukan link video.
export function youtubeId(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^(www|m)\./, '');
    let id = null;
    if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
    else if (host === 'youtube.com' || host === 'music.youtube.com') {
      id = u.pathname === '/watch' ? u.searchParams.get('v') : u.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?]+)/)?.[1];
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

// Mengembalikan pesan error, atau null jika tautan sesuai dengan platform channel.
export function validatePostUrl(url, platform) {
  let u;
  try { u = new URL(url); } catch { return 'Tautan tidak valid.'; }
  if (!['http:', 'https:'].includes(u.protocol)) return 'Tautan harus diawali http:// atau https://.';

  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  const allowed = HOSTS[platform] ?? [];
  if (!allowed.some((h) => host === h || host.endsWith(`.${h}`))) {
    return `Domain "${u.hostname}" tidak sesuai dengan platform channel. Gunakan tautan dari ${allowed.join(' atau ')}.`;
  }
  if (platform === 'youtube' && !youtubeId(url)) {
    return 'Tautan YouTube harus ke sebuah video, contoh: https://www.youtube.com/watch?v=ID_VIDEO, https://youtu.be/ID_VIDEO, atau .../shorts/ID_VIDEO.';
  }
  return null;
}
