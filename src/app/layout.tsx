import Providers from '@/components/layout/providers';
import { PwaShell } from '@/components/pwa/pwa-shell';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import ThemeProvider from '@/components/themes/theme-provider';
import {
  APP_DESCRIPTION,
  APP_NAME,
  PWA_THEME_COLOR_DARK,
  PWA_THEME_COLOR_LIGHT
} from '@/config/site';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_NAME
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  },
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: APP_NAME,
    description: APP_DESCRIPTION
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: PWA_THEME_COLOR_LIGHT },
    { media: '(prefers-color-scheme: dark)', color: PWA_THEME_COLOR_DARK }
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
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
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${PWA_THEME_COLOR_DARK}')
                }
              } catch (_) {}

              (function () {
                var ATTRS = ['fdprocessedid', 'data-new-gr-c-s-check-loaded', 'data-gr-ext-installed'];
                function strip() {
                  for (var i = 0; i < ATTRS.length; i++) {
                    var nodes = document.querySelectorAll('[' + ATTRS[i] + ']');
                    for (var j = 0; j < nodes.length; j++) nodes[j].removeAttribute(ATTRS[i]);
                  }
                }
                strip();
                var observer = new MutationObserver(function (mutations) {
                  for (var m = 0; m < mutations.length; m++) {
                    var t = mutations[m].target;
                    if (t && t.nodeType === 1) {
                      for (var i = 0; i < ATTRS.length; i++) {
                        if (t.hasAttribute && t.hasAttribute(ATTRS[i])) {
                          t.removeAttribute(ATTRS[i]);
                        }
                      }
                    }
                  }
                  strip();
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  subtree: true,
                  attributeFilter: ATTRS,
                  childList: true
                });
                window.addEventListener('load', function () {
                  strip();
                  setTimeout(function () {
                    strip();
                    observer.disconnect();
                  }, 5000);
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
          'standalone:overscroll-none',
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
              <PwaShell>
                <Toaster />
                {children}
              </PwaShell>
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
