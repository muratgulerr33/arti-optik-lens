import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Lazy initialization function to avoid build-time DB connection
function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing in .env.local');
  }

  // Normalize DATABASE_URL: postgres:// -> postgresql:// (pg driver requirement)
  const rawUrl = process.env.DATABASE_URL;
  const normalizedUrl = rawUrl.replace(/^postgres:\/\//, 'postgresql://');

  // Node-postgres connection pool
  const pool = new Pool({
    connectionString: normalizedUrl,
  });

  // Drizzle database instance
  return drizzle(pool, { schema });
}

// Lazy getter - only initializes when accessed
// This ensures DB connection is only attempted at runtime, not during build
let dbInstance: ReturnType<typeof getDb> | null = null;

/** Returns the real Drizzle instance for adapters (e.g. DrizzleAdapter) that require it. */
export function getDbForAdapter(): ReturnType<typeof getDb> {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is missing. Database operations are not available.');
    }
    try {
      dbInstance = getDb();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Database connection failed';
      throw new Error(msg);
    }
  }
  return dbInstance;
}

type DbType = ReturnType<typeof getDb>;

const handler: ProxyHandler<DbType> = {
  get(_target, prop: PropertyKey) {
    // Only initialize DB when actually accessed (runtime)
    // This prevents build-time connection attempts
    if (!dbInstance) {
      // Check DATABASE_URL before attempting connection
      // If missing during build, return a proxy that throws on any method call
      // This allows build to succeed while still providing runtime errors
      if (!process.env.DATABASE_URL) {
        // Return a proxy that throws on any property access
        // This works for drizzle methods like .select(), .insert(), etc.
        return new Proxy({} as Record<PropertyKey, unknown>, {
          get() {
            throw new Error('DATABASE_URL is missing. Database operations are not available.');
          },
          apply() {
            throw new Error('DATABASE_URL is missing. Database operations are not available.');
          },
        });
      }
      try {
        dbInstance = getDb();
      } catch (error) {
        // If connection fails, return a proxy that throws
        const errorMessage = error instanceof Error ? error.message : 'Database connection failed';
        return new Proxy({} as Record<PropertyKey, unknown>, {
          get() {
            throw new Error(errorMessage);
          },
          apply() {
            throw new Error(errorMessage);
          },
        });
      }
    }
    return dbInstance[prop as keyof DbType];
  },
};

export const db = new Proxy({} as DbType, handler);
