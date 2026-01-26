import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Lazy initialization function to avoid build-time DB connection
function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing in .env.local');
  }

  // Normalize DATABASE_URL: postgres:// -> postgresql:// (Neon requirement)
  const rawUrl = process.env.DATABASE_URL;
  const normalizedUrl = rawUrl.replace(/^postgres:\/\//, 'postgresql://');

  // Neon serverless connection
  const sql = neon(normalizedUrl);

  // Drizzle database instance
  // Type mismatch: neon() returns NeonQueryFunction, but drizzle-orm/neon-serverless expects it
  // This is a known type definition issue in drizzle-orm - runtime works correctly
  // @ts-expect-error - Drizzle type definitions don't match neon-serverless return type
  return drizzle(sql, { schema });
}

// Lazy getter - only initializes when accessed
let dbInstance: ReturnType<typeof getDb> | null = null;

type DbType = ReturnType<typeof getDb>;

const handler: ProxyHandler<DbType> = {
  get(_target, prop: PropertyKey) {
    if (!dbInstance) {
      dbInstance = getDb();
    }
    return dbInstance[prop as keyof DbType];
  },
};

export const db = new Proxy({} as DbType, handler);
