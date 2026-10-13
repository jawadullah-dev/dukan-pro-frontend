import type { NextAuthConfig } from 'next-auth';
import type { AuthAccountRole } from '@/lib/auth/accounts';

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
        token.accessToken = user.accessToken;
        token.subscriptionEndsAt = user.subscriptionEndsAt;
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
      session.accessToken = token.accessToken as string;
      return session;
    },

    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isDashboard =
        pathname.startsWith('/dashboard') || /\/(en|ur|ps)\/dashboard/.test(pathname);
      const isAuthApi = pathname.startsWith('/api/auth');

      if (isAuthApi) return true;
      if (isDashboard) return isLoggedIn;
      return true;
    }
  }
} satisfies NextAuthConfig;
