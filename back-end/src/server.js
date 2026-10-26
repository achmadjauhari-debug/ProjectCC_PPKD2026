import 'dotenv/config';
import app from './app.js';
import { prisma } from './prisma.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET belum diatur. Salin .env.example menjadi .env lalu isi nilainya.');
  process.exit(1);
}
const port = Number(process.env.PORT || 4000);
try {
  await prisma.$queryRaw`SELECT 1`;
} catch (e) {
  console.error('Tidak bisa terhubung ke MySQL. Periksa DATABASE_URL di .env dan jalankan "npm run migrate".\n', e.message);
  process.exit(1);
}
const server = app.listen(port, () => console.log(`API berjalan di http://localhost:${port}`));

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
