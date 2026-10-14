import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { authConfig } from '@/auth.config';
import { isValidPkMobile, normalizePhone } from '@/lib/auth/phone';
import type { LoginResult, AuthResponseData, AuthResponseBody } from '@/types/auth';
import { API_BASE_URL } from '@/constants/api';

async function executeAuthPost(
  endpoint: string,
  phone: string,
  password: string
): Promise<AuthResponseData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });

    if (!res.ok) return null;

    const json = (await res.json()) as AuthResponseBody;
    const data = json?.data;
    if (!data?.accessToken) return null;
    return data;
  } catch {
    return null;
  }
}

async function tryOwnerLogin(phone: string, password: string): Promise<LoginResult | null> {
  const data = await executeAuthPost('/auth/login', phone, password);
  if (!data?.accessToken || !data.user) return null;

  return {
    id: data.user.id,
    name: data.user.name,
    phone: data.user.phone,
    role: 'OWNER',
    shopId: data.shopId ?? null,
    shopName: data.shop?.name ?? null,
    accessToken: data.accessToken,
    subscriptionEndsAt: data.shop?.subscriptionEndsAt ?? null
  };
}

async function tryPlatformAdminLogin(phone: string, password: string): Promise<LoginResult | null> {
  const data = await executeAuthPost('/auth/platform-admin/login', phone, password);
  if (!data?.accessToken || !data.admin) return null;

  return {
    id: data.admin.id,
    name: data.admin.name,
    phone: data.admin.phone,
    role: 'SUPER_ADMIN',
    shopId: null,
    shopName: null,
    accessToken: data.accessToken,
    subscriptionEndsAt: null
  };
}

const credentialsSchema = z.object({
  phone: z.string().refine(isValidPkMobile, 'Enter a valid mobile number'),
  password: z.string().min(1),
  isPlatformAdmin: z.enum(['true', 'false']).optional()
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        password: { label: 'Password', type: 'password' },
        isPlatformAdmin: { label: 'Is Platform Admin', type: 'hidden' }
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const phone = normalizePhone(parsed.data.phone);
        const { password, isPlatformAdmin } = parsed.data;

        if (isPlatformAdmin === 'true') {
          return await tryPlatformAdminLogin(phone, password);
        }

        const ownerResult = await tryOwnerLogin(phone, password);
        if (ownerResult) return ownerResult;

        return await tryPlatformAdminLogin(phone, password);
      }
    })
  ]
});
