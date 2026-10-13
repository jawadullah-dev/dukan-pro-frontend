import type { DefaultSession } from 'next-auth';
import type { AuthAccountRole } from '@/lib/auth/accounts';

declare module 'next-auth' {
  interface User {
    role: AuthAccountRole;
    shopId: string | null;
    shopName: string | null;
    accessToken: string;
    subscriptionEndsAt: string | null;
  }

  interface Session {
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
