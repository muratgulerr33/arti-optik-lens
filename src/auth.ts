import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Credentials from 'next-auth/providers/credentials';
import { getDbForAdapter } from '@/db/connection';
import { users, accounts, sessions, verificationTokens } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Use getDbForAdapter() so adapter receives real Drizzle instance (Proxy fails is(db, PgDatabase))
  // Cast to satisfy NextAuth Adapter type vs custom user schema (role) mismatch
  adapter: DrizzleAdapter(getDbForAdapter(), {
    usersTable: users as any,
    accountsTable: accounts as any,
    sessionsTable: sessions as any,
    verificationTokensTable: verificationTokens as any,
  }) as any,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const userResults = await getDbForAdapter()
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        if (userResults.length === 0 || !userResults[0].password) {
          return null;
        }

        const user = userResults[0];
        const password = user.password;
        if (!password) return null;
        const isValid = await bcrypt.compare(
          credentials.password as string,
          password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role || 'user',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On login, add user role and id to token
      if (user) {
        token.id = user.id ?? '';
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role and id to session from token
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'user' | 'admin';
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
  },
});
