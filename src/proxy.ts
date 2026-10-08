import NextAuth from 'next-auth';
import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { authConfig } from '@/auth.config';
import {
  homePathForRole,
  loginPath,
  redirectForRole,
  shortcutPathForRole,
  extractLocale
} from '@/lib/auth/routes';
import { routing } from '@/i18n/routing';

/**
 * Combined middleware:
 *  1. next-intl handles locale prefixing (/ → /en redirect + NEXT_LOCALE cookie + Accept-Language)
 *  2. NextAuth authorizes users and reads role from JWT
 *  3. Role + login-state based redirects run inside the auth() callback
 *
 * Middleware pattern: compose by running intl first, then auth with its matcher
 * via the exported combined handler.
 */

const handleI18nRouting = createIntlMiddleware(routing);

const { auth } = NextAuth(authConfig);

/**
 * Auth-aware redirect handler. Runs AFTER next-intl has already set the locale
 * cookie and redirected to the prefixed URL. All URLs at this point start with
 * /en, /ur, or /ps (except PWA / API / _next assets).
 */
function handleAuthRedirects(req: NextRequest, session: { user?: { role?: string } } | null) {
  const { pathname } = req.nextUrl;
  const repeatedLocalePrefix = pathname.match(/^\/(en|ur|ps)(?:\/(?:en|ur|ps))+(?=\/|$)/);
  if (repeatedLocalePrefix) {
    const url = req.nextUrl.clone();
    url.pathname = `/${repeatedLocalePrefix[1]}${pathname.slice(repeatedLocalePrefix[0].length)}`;
    return NextResponse.redirect(url);
  }

  const locale = extractLocale(pathname);
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  const isLoginPage = pathname.endsWith('/login') || /\/[a-z]{2}\/login(\/|$)/.test(pathname);
  // Strip locale before dashboard check
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

  if (isLoggedIn && role) {
    const roleRedirect = redirectForRole(pathname, role);
    if (roleRedirect) {
      return NextResponse.redirect(new URL(roleRedirect, req.nextUrl));
    }
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL(homePathForRole(role, locale), req.nextUrl));
  }

  // Bare "/" — next-intl normalizes this, but we redirect logged-in users to dashboard.
  if ((pathname === '/' || /^\/(en|ur|ps)\/?$/.test(pathname)) && isLoggedIn) {
    const to = req.nextUrl.searchParams.get('to');
    const shortcut = shortcutPathForRole(to, role, locale);
    return NextResponse.redirect(new URL(shortcut ?? homePathForRole(role, locale), req.nextUrl));
  }

  if ((pathname === '/' || /^\/(en|ur|ps)\/?$/.test(pathname)) && !isLoggedIn) {
    return NextResponse.redirect(new URL(loginPath(locale), req.nextUrl));
  }

  // /[locale]/dashboard exact without trailing
  if (/^\/(en|ur|ps)\/dashboard\/?$/.test(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL(homePathForRole(role, locale), req.nextUrl));
  }

  return handleI18nRouting(req);
}

export const proxy = auth((req) => {
  // next-intl uses createIntlMiddleware to rewrite URLs with locale, we compose it.
  return handleAuthRedirects(req, req.auth ?? null);
}) as unknown as (req: NextRequest) => Promise<NextResponse<unknown>>;

export const config = {
  // Match all paths except static files / _next.
  matcher: [
    '/',
    '/(en|ur|ps)/:path*',
    '/((?!api|_next|_vercel|serwist|monitoring|icons|manifest.webmanifest|sw\\.js|sw\\.js\\.map|favicon\\.ico|~offline|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'
  ]
};
