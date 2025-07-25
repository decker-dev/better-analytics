import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from "postgres";

import * as schema from "./schema";

const getEnvVariable = (name: string) => {
  const value = process.env[name];
  if (value == null) throw new Error(`environment variable ${name} not found`);
  return value;
};

declare global {
  // eslint-disable-next-line no-var -- only var works here
  var db: PostgresJsDatabase<typeof schema> | undefined;
}

// biome-ignore lint/suspicious/noRedeclare: <explanation>
let db: PostgresJsDatabase<typeof schema>;

const DATABASE_URL = getEnvVariable("DATABASE_URL");

if (process.env.NODE_ENV === "production") {
  db = drizzle(postgres(DATABASE_URL), { schema });
} else {
  if (!global.db) global.db = drizzle(postgres(DATABASE_URL), { schema });
  db = global.db;
}

export { db };
export { schema };
export const client = postgres(DATABASE_URL);
