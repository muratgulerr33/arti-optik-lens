import type { DrizzleAdapter } from '@auth/drizzle-adapter';
import type { getDbForAdapter } from '@/db/connection';

/**
 * Second parameter type of DrizzleAdapter when used with our DB (Pg).
 * Used for type assertion in auth.ts; package does not export DefaultPostgresSchema.
 */
export type PgAdapterSchema = NonNullable<
  Parameters<typeof DrizzleAdapter<ReturnType<typeof getDbForAdapter>>>[1]
>;
