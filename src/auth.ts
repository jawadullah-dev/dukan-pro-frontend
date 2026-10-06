import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { authConfig } from '@/auth.config';
import { findAccountByPhone } from '@/lib/auth/accounts';
import { isValidPkMobile, normalizePhone } from '@/lib/auth/phone';

const credentialsSchema = z.object({
  phone: z.string().refine(isValidPkMobile, 'Enter a valid mobile number'),
  password: z.string().min(1)
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const phone = normalizePhone(parsed.data.phone);
        const account = findAccountByPhone(phone);
        if (!account) return null;

        const valid = await compare(parsed.data.password, account.passwordHash);
        if (!valid) return null;

        return {
          id: account.id,
          // NextAuth session shape expects email; store phone so UI can show it.
          email: account.phone,
          name: account.name,
          role: account.role,
          shopId: account.shopId,
          shopName: account.shopName
        };
      }
    })
  ]
});
