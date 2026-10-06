import type { AuthAccountRole } from '@/lib/auth/accounts';

export const SHOP_HOME = '/dashboard/overview';
export const PLATFORM_HOME = '/dashboard/platform';

const PLATFORM_PREFIX = '/dashboard/platform';
const SETTINGS_PREFIX = '/dashboard/settings';

export function homePathForRole(role: AuthAccountRole | string | undefined): string {
  return role === 'SUPER_ADMIN' ? PLATFORM_HOME : SHOP_HOME;
}

export function isPlatformRoute(pathname: string): boolean {
  return pathname === PLATFORM_PREFIX || pathname.startsWith(`${PLATFORM_PREFIX}/`);
}

export function isSettingsRoute(pathname: string): boolean {
  return pathname === SETTINGS_PREFIX || pathname.startsWith(`${SETTINGS_PREFIX}/`);
}

/** Shop operational routes — hidden from platform super admin. */
export function isShopOnlyRoute(pathname: string): boolean {
  if (!pathname.startsWith('/dashboard')) return false;
  if (isPlatformRoute(pathname) || isSettingsRoute(pathname)) return false;
  return true;
}

export function canAccessPath(
  pathname: string,
  role: AuthAccountRole | string | undefined
): boolean {
  if (!pathname.startsWith('/dashboard')) return true;
  if (!role) return true;
  if (role === 'SUPER_ADMIN') {
    return isPlatformRoute(pathname) || isSettingsRoute(pathname);
  }
  return !isPlatformRoute(pathname);
}

/**
 * Role-based redirects. Only act when role is known —
 * never treat a missing role as shop admin (that bounced super-admin off platform routes).
 */
export function redirectForRole(
  pathname: string,
  role: AuthAccountRole | string | undefined
): string | null {
  if (!pathname.startsWith('/dashboard')) return null;
  if (!role) return null;

  if (role === 'SUPER_ADMIN' && isShopOnlyRoute(pathname)) {
    return PLATFORM_HOME;
  }
  if (role !== 'SUPER_ADMIN' && isPlatformRoute(pathname)) {
    return SHOP_HOME;
  }
  return null;
}
