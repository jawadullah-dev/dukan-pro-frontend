import type { DefaultSession } from 'next-auth';
import type { AuthAccountRole } from '@/lib/auth/accounts';

declare module 'next-auth' {
  interface User {
    role: AuthAccountRole;
    shopId: string | null;
    shopName: string | null;
    /** Backend-issued Bearer token. Forwarded on every API request. */
    accessToken: string;
    /** ISO date when the shop subscription expires. null for platform admins. */
    subscriptionEndsAt: string | null;
  }

  interface Session {
    /** Backend-issued Bearer token. Use on every apiRequest call. */
    accessToken: string;
    user: {
      id: string;
      role: AuthAccountRole;
      shopId: string | null;
      shopName: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: AuthAccountRole;
    shopId: string | null;
    shopName: string | null;
    accessToken: string;
    subscriptionEndsAt: string | null;
  }
}
