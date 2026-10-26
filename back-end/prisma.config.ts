import 'dotenv/config';
// 🌟 Impor fungsi 'env' bawaan dari prisma/config
import { defineConfig, env } from 'prisma/config'; 

export default defineConfig({
  schema: 'prisma/schema.prisma',
  
  datasource: {
    // 📄 Fungsi env() ini akan otomatis membaca DATABASE_URL dari file .env tanpa memakai objek 'process'
    url: env('DATABASE_URL') || "mysql://root:@127.0.0.1:3306/creator_pipeline"
  },
  
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.js',
  }
});
