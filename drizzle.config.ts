import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'vinson.liara.cloud',
    port: 34807,
    user: 'root',
    password: '3ahRBsm22lzKgXKwIE1v5G94',
    database: 'postgres',
    ssl: false,
  },
});
