import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { authConfig } from '@/auth.config';
import { isValidPkMobile, normalizePhone } from '@/lib/auth/phone';
import type { AuthAccountRole } from '@/lib/auth/accounts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** Minimal shape we read from both login responses. */
interface LoginResult {
  id: string;
  name: string;
  phone: string;
  role: AuthAccountRole;
  shopId: string | null;
  shopName: string | null;
  accessToken: string;
  subscriptionEndsAt: string | null;
}

async function tryOwnerLogin(phone: string, password: string): Promise<LoginResult | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });

    if (!res.ok) return null;

    const json = await res.json();
    // Backend wraps: { message, data: { accessToken, user, shopId, shop } }
    const data = json?.data;
    if (!data?.accessToken) return null;

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
  } catch {
    return null;
  }
}

async function tryPlatformAdminLogin(phone: string, password: string): Promise<LoginResult | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/platform-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });

    if (!res.ok) return null;

    const json = await res.json();
    // Backend wraps: { message, data: { accessToken, admin: { id, name, phone } } }
    const data = json?.data;
    if (!data?.accessToken) return null;

    return {
      id: data.admin.id,
      name: data.admin.name,
      phone: data.admin.phone,
      // Backend calls it PLATFORM_ADMIN; the rest of the frontend uses SUPER_ADMIN.
      role: 'SUPER_ADMIN',
      shopId: null,
      shopName: null,
      accessToken: data.accessToken,
      subscriptionEndsAt: null
    };
  } catch {
    return null;
  }
}

const credentialsSchema = z.object({
  phone: z.string().refine(isValidPkMobile, 'Enter a valid mobile number'),
  password: z.string().min(1),
  /**
   * When true the form is on /platform-admin/login and we skip the owner
   * attempt entirely. This prevents leaking that a number is registered as
   * an owner when a platform admin tries to log in.
   */
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

        // Platform admin page → only try the admin endpoint.
        if (isPlatformAdmin === 'true') {
          return await tryPlatformAdminLogin(phone, password);
        }

        // Owner login page → try owner first, then fall back to platform admin.
        const ownerResult = await tryOwnerLogin(phone, password);
        if (ownerResult) return ownerResult;

        return await tryPlatformAdminLogin(phone, password);
      }
    })
  ]
});
