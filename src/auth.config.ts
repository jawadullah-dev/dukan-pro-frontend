import type { NextAuthConfig } from 'next-auth';
import type { AuthAccountRole } from '@/lib/auth/accounts';

/**
 * Edge-safe Auth.js config (no Node crypto / bcrypt).
 * JWT/session callbacks live here so `proxy.ts` gets `user.role`.
 * Credentials provider lives in `auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: '/login'
  },
  providers: [],
  session: {
    strategy: 'jwt'
  },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.shopId = user.shopId;
        token.shopName = user.shopName;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.role) {
        session.user.role = token.role as AuthAccountRole;
      }
      session.user.shopId = (token.shopId as string | null | undefined) ?? null;
      session.user.shopName = (token.shopName as string | null | undefined) ?? null;
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isLoginPage = pathname.startsWith('/login');
      const isDashboard = pathname.startsWith('/dashboard');
      const isAuthApi = pathname.startsWith('/api/auth');

      if (isAuthApi) return true;
      if (isDashboard) return isLoggedIn;
      if (isLoginPage && isLoggedIn) return true;
      return true;
    }
  }
} satisfies NextAuthConfig;
