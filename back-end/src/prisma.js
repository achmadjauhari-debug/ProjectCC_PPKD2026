import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.ts";

// Prisma 7 wajib memakai driver adapter. Untuk MySQL: @prisma/adapter-mariadb.
// DATABASE_URL (mysql://user:pass@host:port/db) diurai menjadi opsi koneksi.
function adapterFromUrl(url) {
  if (!url)
    throw new Error(
      "DATABASE_URL belum diatur. Salin .env.example menjadi .env lalu isi nilainya.",
    );

  const u = new URL(url);
  return new PrismaMariaDb({
    host: u.hostname || "127.0.0.1",
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username || "root"),
    password: decodeURIComponent(u.password || ""),
    database: u.pathname.slice(1),
    connectionLimit: 10,

    allowPublicKeyRetrieval: true, // MySQL 8 (caching_sha2_password) tanpa TLS di lingkungan lokal
    acquireTimeout: 10000,

    // 💡 AKTIFKAN INI AGAR TOMBONGAN EROR ASLI DARI DRIVER TERLIHAT JELAS
    trace: true,
  });
}

export const prisma = new PrismaClient({
  adapter: adapterFromUrl(process.env.DATABASE_URL),
});
