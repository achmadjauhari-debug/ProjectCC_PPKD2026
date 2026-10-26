import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  // Semua request /api diteruskan ke backend Express saat development.
  server: { port: 5173, proxy: { '/api': 'http://localhost:4000' } },
});
