import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";
import { requireServerEnv } from "@/lib/env";

const connectionString = requireServerEnv("DATABASE_URL");

const globalForDb = globalThis as unknown as {
  studradarPool?: Pool;
};

export const pool =
  globalForDb.studradarPool ??
  new Pool({
    connectionString,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.studradarPool = pool;
}

export const db = drizzle(pool, { schema });
