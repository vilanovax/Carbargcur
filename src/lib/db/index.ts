import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const connectionString = process.env.DATABASE_URL;

// For migrations
export const migrationClient = postgres(connectionString, { max: 1 });

// For queries - optimized connection pool settings
const queryClient = postgres(connectionString, {
  max: 20,              // Increased pool size for concurrent requests
  idle_timeout: 30,     // 30 seconds - connections stay alive longer
  connect_timeout: 5,   // 5 seconds - reasonable timeout for connection
  max_lifetime: 60 * 5, // 5 minutes - max connection lifetime
});

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
