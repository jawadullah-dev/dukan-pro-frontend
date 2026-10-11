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
    /**
     * Runs on every sign-in and on every token refresh.
     * `user` is only present on the initial sign-in — copy everything we need
     * into the token so it survives as an encrypted cookie.
     */
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.shopId = user.shopId;
        token.shopName = user.shopName;
        // Store the backend-issued Bearer token. We forward it on every API
        // request instead of re-authenticating on the backend.
        token.accessToken = user.accessToken;
        token.subscriptionEndsAt = user.subscriptionEndsAt;
      }
      return token;
    },

    /**
     * Runs whenever Session is accessed from a React Server Component, route
     * handler, or `useSession()`. Shape it into what the rest of the app reads.
     */
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.role) {
        session.user.role = token.role as AuthAccountRole;
      }
      session.user.shopId = (token.shopId as string | null | undefined) ?? null;
      session.user.shopName = (token.shopName as string | null | undefined) ?? null;
      // Expose the Bearer token so apiRequest() can attach it to every call.
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
