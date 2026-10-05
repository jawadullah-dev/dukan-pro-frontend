import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import ThemeProvider from '@/components/themes/theme-provider';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Shadcn Dashboard - Next.js Admin Dashboard Template',
    template: '%s | Shadcn Dashboard'
  },
  description:
    'Free, open source admin dashboard starter built with Next.js 16, shadcn/ui, Tailwind CSS, and TypeScript.',
  openGraph: {
    title: 'Shadcn Dashboard - Next.js Admin Dashboard Template',
    description:
      'Free, open source admin dashboard starter built with Next.js 16, shadcn/ui, Tailwind CSS, and TypeScript.',
    siteName: 'Shadcn Dashboard',
    type: 'website',
    images: [
      {
        url: '/shadcn-dashboard.png',
        width: 3200,
        height: 1600,
        alt: 'Shadcn Dashboard overview page'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shadcn Dashboard - Next.js Admin Dashboard Template',
    description:
      'Free, open source admin dashboard starter built with Next.js 16, shadcn/ui, Tailwind CSS, and TypeScript.',
    images: ['/shadcn-dashboard.png']
  }
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue);
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME;

  return (
    <html lang='en' suppressHydrationWarning data-theme={themeToApply}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Set meta theme color
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}

              // Strip attributes injected by browser extensions before React hydrates
              // (e.g. fdprocessedid from password managers / form fillers).
              (function () {
                var ATTRS = ['fdprocessedid', 'data-new-gr-c-s-check-loaded', 'data-gr-ext-installed'];
                function strip() {
                  for (var i = 0; i < ATTRS.length; i++) {
                    var nodes = document.querySelectorAll('[' + ATTRS[i] + ']');
                    for (var j = 0; j < nodes.length; j++) nodes[j].removeAttribute(ATTRS[i]);
                  }
                }
                strip();
                var observer = new MutationObserver(strip);
                observer.observe(document.documentElement, {
                  attributes: true,
                  subtree: true,
                  attributeFilter: ATTRS
                });
                window.addEventListener('DOMContentLoaded', function () {
                  strip();
                  setTimeout(function () { observer.disconnect(); }, 2000);
                });
              })();
            `
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={themeToApply}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
