import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '@/env';

declare global {
  // eslint-disable-next-line no-var -- only var works here
  var db: PostgresJsDatabase<typeof schema> | NeonHttpDatabase<typeof schema> | undefined;
}

// biome-ignore lint/suspicious/noRedeclare: <explanation>
let db: PostgresJsDatabase<typeof schema> | NeonHttpDatabase<typeof schema>;

if (env.NODE_ENV === "production") {
  // Use Neon in production
  const sql = neon(env.DATABASE_URL);
  db = neonDrizzle(sql, { schema });
} else {
  // Use local PostgreSQL in development
  if (!global.db) {
    const sql = postgres(env.DATABASE_URL);
    global.db = drizzle(sql, { schema });
  }
  db = global.db;
}

export { db };
export { schema }; 