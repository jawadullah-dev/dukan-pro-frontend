import type { DefaultSession } from 'next-auth';
import type { AuthAccountRole } from '@/lib/auth/accounts';

declare module 'next-auth' {
  interface User {
    role: AuthAccountRole;
    shopId: string | null;
    shopName: string | null;
  }

  interface Session {
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
  }
}
