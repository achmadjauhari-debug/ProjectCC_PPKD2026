import bcrypt from 'bcryptjs';
import { prisma } from '../src/prisma.js';

const EMAIL = 'demo@kreator.id';
const d = (s) => new Date(`${s}T00:00:00.000Z`);

// Hapus data demo lama (relasi ikut terhapus lewat ON DELETE CASCADE)
await prisma.user.deleteMany({ where: { email: EMAIL } });

const user = await prisma.user.create({
  data: {
    name: 'Dewi Kreator',
    email: EMAIL,
    password_hash: await bcrypt.hash('demo1234', 12),
    channels: {
      create: [
        { platform: 'youtube', handle_name: '@dewibikin' },
        { platform: 'tiktok', handle_name: '@dewibikin.id' },
      ],
    },
  },
  include: { channels: { orderBy: { id: 'asc' } } },
});
const [youtube, tiktok] = user.channels;

await prisma.content.create({
  data: {
    user_id: user.id,
    channel_id: youtube.id,
    title: '5 alat editing murah untuk pemula',
    description: 'Rekomendasi tool gratis dan berbayar di bawah Rp100 ribu.',
    script_draft: 'Hook: Edit video bagus tidak harus mahal...',
    format_type: 'long_video',
    status: 'scripting',
    priority: 'high',
    scheduled_date: d('2026-10-28'),
    checklists: {
      create: [
        { task_name: 'Draft hook naskah selesai', is_completed: true },
        { task_name: 'B-roll direkam' },
        { task_name: 'Thumbnail disetujui' },
      ],
    },
  },
});

await prisma.content.create({
  data: {
    user_id: user.id,
    channel_id: tiktok.id,
    title: 'Behind the scene setup meja kerja',
    description: 'Tur singkat setup kamera dan lampu.',
    format_type: 'short_video',
    status: 'idea',
    priority: 'medium',
  },
});

await prisma.content.create({
  data: {
    user_id: user.id,
    channel_id: youtube.id,
    title: 'Vlog sehari jadi kreator',
    description: 'Rutinitas produksi dari pagi sampai upload.',
    script_draft: 'Opening: bangun jam 6...',
    format_type: 'long_video',
    status: 'published',
    priority: 'low',
    scheduled_date: d('2026-10-10'),
    published_date: d('2026-10-10'),
    published_url: 'https://youtube.com/watch?v=contoh123',
    metrics: {
      create: [
        { recorded_at: d('2026-10-12'), views_count: 1240, likes_count: 96, comments_count: 14, shares_count: 8 },
        { recorded_at: d('2026-10-17'), views_count: 3810, likes_count: 301, comments_count: 42, shares_count: 27 },
      ],
    },
  },
});

console.log(`Seeder selesai. Login demo: ${EMAIL} / demo1234`);
await prisma.$disconnect();
