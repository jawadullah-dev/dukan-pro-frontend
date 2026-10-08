import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { getTranslations, setRequestLocale, getLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/request';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import ThemeProvider from '@/components/themes/theme-provider';
import {
  APP_DESCRIPTION,
  APP_NAME,
  PWA_THEME_COLOR_DARK,
  PWA_THEME_COLOR_LIGHT
} from '@/config/site';
import { isRtlLocale, locales } from '@/i18n/request';
import { cn } from '@/lib/utils';
import '../styles/globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');

  const defaultMetadata = {
    metadataBase,
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
    } as Metadata['appleWebApp'],
    formatDetection: {
      telephone: false
    },
    icons: {
      icon: [
        { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }
      ],
      apple: [
        {
          url: '/icons/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png'
        }
      ]
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

  try {
    const locale = await getLocale();
    if (!isLocale(locale)) return defaultMetadata;
    setRequestLocale(locale);

    let defaultTitle = APP_NAME;
    try {
      const t = await getTranslations('Metadata');
      defaultTitle = t('title', { appName: APP_NAME });
    } catch {
      // Fallback if Metadata namespace does not exist
    }

    const alternates: Metadata['alternates'] = {
      canonical: `/${locale}`,
      languages: {}
    };

    for (const l of locales) {
      alternates.languages![l] = `/${l}`;
    }

    return {
      ...defaultMetadata,
      title: {
        default: defaultTitle,
        template: `%s | ${APP_NAME}`
      },
      alternates
    };
  } catch {
    return defaultMetadata;
  }
}

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
  const requestedLocale = await getLocale();
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en';
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue);
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME;

  const dir = isRtlLocale(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning data-theme={themeToApply}>
      <head>
        <Script
          id='theme-and-extension-attribute-bootstrap'
          strategy='beforeInteractive'
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
            {children}
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
