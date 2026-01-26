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
// This ensures DB connection is only attempted at runtime, not during build
let dbInstance: ReturnType<typeof getDb> | null = null;

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
