import type { AuthAccountRole } from '@/lib/auth/accounts';
import { defaultLocale, locales, isLocale, type AppLocale } from '@/i18n/request';

export { defaultLocale, locales, isLocale, type AppLocale };

export const SHOP_HOME = '/dashboard/overview';
export const PLATFORM_HOME = '/dashboard/platform';
const SETTINGS_PREFIX = '/dashboard/settings';
const PLATFORM_PREFIX = '/dashboard/platform';

export function localize(path: string, locale: AppLocale | string): string {
  if (!path.startsWith('/')) return path;
  const safeLocale = isLocale(locale) ? locale : defaultLocale;
  const alreadyLocalized = locales.some((l) => path === `/${l}` || path.startsWith(`/${l}/`));
  if (alreadyLocalized) return path;
  return `/${safeLocale}${path === '/' ? '' : path}`;
}

export function delocalize(pathname: string): string {
  let path = pathname;
  let strippedLocale = false;

  while (true) {
    const locale = locales.find((l) => path === `/${l}` || path.startsWith(`/${l}/`));
    if (!locale) break;

    path = path.slice(locale.length + 1) || '/';
    strippedLocale = true;
  }

  return strippedLocale ? path : pathname;
}

export function extractLocale(pathname: string): AppLocale {
  for (const l of locales) {
    const prefix = `/${l}`;
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return l;
  }
  return defaultLocale;
}

export function homePathForRole(
  role: AuthAccountRole | string | undefined,
  locale: AppLocale | string = defaultLocale
): string {
  const base = role === 'SUPER_ADMIN' ? PLATFORM_HOME : SHOP_HOME;
  return localize(base, locale);
}

export function shortcutPathForRole(
  to: string | null | undefined,
  role: AuthAccountRole | string | undefined,
  locale: AppLocale | string = defaultLocale
): string | null {
  if (!to || role === 'SUPER_ADMIN') return null;
  switch (to) {
    case 'sales':
      return localize('/dashboard/sales/new', locale);
    case 'customers':
      return localize('/dashboard/customers', locale);
    case 'inventory':
      return localize('/dashboard/inventory', locale);
    default:
      return null;
  }
}

export function loginPath(locale: AppLocale | string = defaultLocale): string {
  return localize('/login', locale);
}

export function isPlatformRoute(pathname: string): boolean {
  const p = delocalize(pathname);
  return p === PLATFORM_PREFIX || p.startsWith(`${PLATFORM_PREFIX}/`);
}

export function isSettingsRoute(pathname: string): boolean {
  const p = delocalize(pathname);
  return p === SETTINGS_PREFIX || p.startsWith(`${SETTINGS_PREFIX}/`);
}

export function isShopOnlyRoute(pathname: string): boolean {
  const p = delocalize(pathname);
  if (!p.startsWith('/dashboard')) return false;
  if (isPlatformRoute(p) || isSettingsRoute(p)) return false;
  return true;
}

export function canAccessPath(
  pathname: string,
  role: AuthAccountRole | string | undefined
): boolean {
  const p = delocalize(pathname);
  if (!p.startsWith('/dashboard')) return true;
  if (!role) return true;
  if (role === 'SUPER_ADMIN') {
    return isPlatformRoute(p) || isSettingsRoute(p);
  }
  return !isPlatformRoute(p);
}

export function redirectForRole(
  pathname: string,
  role: AuthAccountRole | string | undefined
): string | null {
  const locale = extractLocale(pathname);
  const p = delocalize(pathname);
  if (!p.startsWith('/dashboard')) return null;
  if (!role) return null;

  if (role === 'SUPER_ADMIN' && isShopOnlyRoute(p)) {
    return homePathForRole(role, locale);
  }
  if (role !== 'SUPER_ADMIN' && isPlatformRoute(p)) {
    return homePathForRole(role, locale);
  }
  return null;
}
