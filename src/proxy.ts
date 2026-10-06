import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/auth.config';
import { homePathForRole, redirectForRole, shortcutPathForRole } from '@/lib/auth/routes';

/**
 * Edge middleware — uses authConfig (includes jwt/session callbacks)
 * so `req.auth.user.role` is available for platform route guards.
 */
const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const isLoginPage = pathname.startsWith('/login');
  const isDashboard = pathname.startsWith('/dashboard');
  const isAuthApi = pathname.startsWith('/api/auth');
  const isPwaAsset =
    pathname.startsWith('/serwist') ||
    pathname.startsWith('/~offline') ||
    pathname === '/manifest.webmanifest' ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/screenshots/');

  if (isAuthApi || isPwaAsset) {
    return NextResponse.next();
  }

  if (isDashboard && !isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && role) {
    const roleRedirect = redirectForRole(pathname, role);
    if (roleRedirect) {
      return NextResponse.redirect(new URL(roleRedirect, req.nextUrl));
    }
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL(homePathForRole(role), req.nextUrl));
  }

  if (pathname === '/' && isLoggedIn) {
    const to = req.nextUrl.searchParams.get('to');
    const shortcut = shortcutPathForRole(to, role);
    return NextResponse.redirect(new URL(shortcut ?? homePathForRole(role), req.nextUrl));
  }

  if (pathname === '/' && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Logged-in user hit /dashboard with no role yet — send to a safe default
  if (pathname === '/dashboard' && isLoggedIn) {
    return NextResponse.redirect(new URL(homePathForRole(role), req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
};
