import NextAuth from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Credentials from 'next-auth/providers/credentials';
import { getDbForAdapter } from '@/db/connection';
import { users, accounts, sessions, verificationTokens } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

type AppJWT = JWT & { id?: string; role?: 'user' | 'admin' };
type AppSessionUser = NonNullable<Session['user']> & { id?: string; role?: 'user' | 'admin' };
type AppSession = Session & { user?: AppSessionUser };

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: (DrizzleAdapter as (db: unknown, schema?: unknown) => Adapter)(
    getDbForAdapter(),
    { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens }
  ),
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
      const t = token as unknown as AppJWT;
      if (user) {
        t.id = user.id ?? '';
        t.role = (user as User & { role?: 'user' | 'admin' }).role;
      }
      return t;
    },
    async session({ session, token }) {
      const s = session as AppSession;
      const t = token as AppJWT;
      if (s.user) {
        s.user.id = t.id as string;
        s.user.role = t.role;
      }
      return s;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
  },
});
