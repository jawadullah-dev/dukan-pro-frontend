/**
 * Demo login accounts (Auth.js Credentials).
 *
 * Mirrors ERD:
 * - platform_admins → SaaS super admin (creates / manages shops)
 * - users (shop OWNER) → dukan shop admin
 *
 * Login is by Pakistani mobile number (most shopkeepers do not use email).
 * Passwords are bcrypt hashes of `admin@123`.
 */

import { normalizePhone } from '@/lib/auth/phone';

export type AuthAccountRole = 'SUPER_ADMIN' | 'OWNER' | 'ADMIN';

export interface AuthAccount {
  id: string;
  /** Pakistani mobile `03XXXXXXXXX` — primary login identifier */
  phone: string;
  name: string;
  /** bcrypt hash of admin@123 */
  passwordHash: string;
  role: AuthAccountRole;
  /** null for platform super admin */
  shopId: string | null;
  shopName: string | null;
}

const PASSWORD_HASH = '$2b$10$iwYLBYtlyv8T3dQoNVK.Ue92QCIV21.q/EA5aLEKBdpgjte8Nw2V.';

export const DEMO_SHOP_ID = 'shop_khalid';
export const DEMO_SHOP_NAME = 'Zeb Mobile Center';
export const DEMO_OWNER_ID = 'user_khalid';

/** Demo super-admin mobile */
export const DEMO_SUPER_ADMIN_PHONE = '03001234567';
/** Demo shop-owner mobile */
export const DEMO_OWNER_PHONE = '03119876543';

export const AUTH_ACCOUNTS: AuthAccount[] = [
  {
    id: 'plat_super_admin',
    phone: DEMO_SUPER_ADMIN_PHONE,
    name: 'Super Admin',
    passwordHash: PASSWORD_HASH,
    role: 'SUPER_ADMIN',
    shopId: null,
    shopName: null
  },
  {
    id: DEMO_OWNER_ID,
    phone: DEMO_OWNER_PHONE,
    name: 'Anwar Zeb',
    passwordHash: PASSWORD_HASH,
    role: 'OWNER',
    shopId: DEMO_SHOP_ID,
    shopName: DEMO_SHOP_NAME
  }
];

export function findAccountByPhone(phone: string): AuthAccount | undefined {
  const normalized = normalizePhone(phone);
  return AUTH_ACCOUNTS.find((account) => account.phone === normalized);
}
