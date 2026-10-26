import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import channelRoutes from './routes/channels.js';
import contentRoutes from './routes/contents.js';
import { HttpError } from './utils.js';

// 🌟 1. DEKLARASIKAN 'app' DI BAGIAN PALING ATAS DAHULU
const app = express();

// 🌟 2. PASANG MIDDLEWARE CORS TEPAT DI BAWAH DEKLARASI 'app'
app.use(cors({ 
  origin: true, // Mengizinkan domain frontend Codespaces Anda secara dinamis
  credentials: true 
}));

app.use(express.json({ limit: '1mb' }));

// Prisma mengembalikan BigInt (id) dan Date (kolom DATE). Samakan dengan kontrak API:
const DATE_ONLY_KEYS = new Set(['scheduled_date', 'published_date', 'recorded_at']);
app.set('json replacer', function jsonReplacer(key, value) {
  const raw = this[key]; 
  if (typeof raw === 'bigint') return Number(raw);
  if (raw instanceof Date && DATE_ONLY_KEYS.has(key)) return raw.toISOString().slice(0, 10);
  return value;
});

// Routing Endpoint Utama
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/channels', channelRoutes);
app.use('/api/v1', contentRoutes); 

app.use((_req, _res, next) => next(new HttpError(404, 'Endpoint tidak ditemukan.')));

// Penanganan error terpusat
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ message: err.message, errors: err.errors });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Body JSON tidak valid.' });
  if (err.code === 'P2002') return res.status(422).json({ message: 'Data sudah ada.' });
  if (err.code === 'P2003') return res.status(422).json({ message: 'Referensi data tidak valid.' });
  if (err.code === 'P2004') return res.status(422).json({ message: 'Data melanggar aturan database.' });
  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
});

export default app;
