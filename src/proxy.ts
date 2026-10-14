import NextAuth from 'next-auth';
import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { authConfig } from '@/auth.config';
import {
  homePathForRole,
  loginPath,
  platformAdminLoginPath,
  redirectForRole,
  shortcutPathForRole,
  extractLocale
} from '@/lib/auth/routes';
import { routing } from '@/i18n/routing';

import type { AuthRedirectSession } from '@/types/auth';

const handleI18nRouting = createIntlMiddleware(routing);

const { auth } = NextAuth(authConfig);

function handleAuthRedirects(req: NextRequest, session: AuthRedirectSession | null) {
  const { pathname } = req.nextUrl;
  const repeatedLocalePrefix = pathname.match(/^\/(?:en|ur|ps)(?:\/(?:en|ur|ps))+(?=\/|$)/);
  if (repeatedLocalePrefix) {
    const url = req.nextUrl.clone();
    url.pathname = `/${repeatedLocalePrefix[0].split('/')[1]}${pathname.slice(repeatedLocalePrefix[0].length)}`;
    return NextResponse.redirect(url);
  }

  const locale = extractLocale(pathname);
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  const isOwnerLoginPage = pathname.endsWith('/login') && !pathname.includes('/platform-admin');
  const isPlatformAdminLoginPage = /\/platform-admin\/login(\/|$)/.test(pathname);
  const isAnyLoginPage = isOwnerLoginPage || isPlatformAdminLoginPage;

  const startsWithDashboard = /^\/(en|ur|ps)\/dashboard(\/|$)/.test(pathname);
  const isAuthApi = pathname.startsWith('/api/auth');
  const isPwaAsset =
    pathname.startsWith('/serwist') ||
    pathname.startsWith('/~offline') ||
    pathname === '/manifest.webmanifest' ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/screenshots/') ||
    pathname === '/favicon.ico' ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.map') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel');

  if (isAuthApi || isPwaAsset) {
    return handleI18nRouting(req);
  }

  if (startsWithDashboard && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = loginPath(locale);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (isAnyLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL(homePathForRole(role, locale), req.nextUrl));
  }

  if (isLoggedIn && role) {
    const roleRedirect = redirectForRole(pathname, role);
    if (roleRedirect) {
      return NextResponse.redirect(new URL(roleRedirect, req.nextUrl));
    }
  }

  if (pathname === '/' || /^\/(en|ur|ps)\/?$/.test(pathname)) {
    if (isLoggedIn) {
      const to = req.nextUrl.searchParams.get('to');
      const shortcut = shortcutPathForRole(to, role, locale);
      return NextResponse.redirect(new URL(shortcut ?? homePathForRole(role, locale), req.nextUrl));
    }
    return NextResponse.redirect(new URL(loginPath(locale), req.nextUrl));
  }

  if (/^\/(en|ur|ps)\/dashboard\/?$/.test(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL(homePathForRole(role, locale), req.nextUrl));
  }

  return handleI18nRouting(req);
}

export const proxy = auth((req) => {
  return handleAuthRedirects(req, req.auth ?? null);
}) as never as (req: NextRequest) => Promise<NextResponse<unknown>>;

export const config = {
  matcher: [
    '/',
    '/(en|ur|ps)/:path*',
    '/((?!api|_next|_vercel|serwist|monitoring|icons|manifest.webmanifest|sw\\.js|sw\\.js\\.map|favicon\\.ico|~offline|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'
  ]
};
