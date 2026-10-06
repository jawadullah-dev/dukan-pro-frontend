'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { useThemeConfig } from '@/components/themes/active-theme';
import { PWA_THEME_COLOR_DARK, PWA_THEME_COLOR_LIGHT } from '@/config/site';

/**
 * Keeps <meta name="theme-color"> in sync with light/dark mode and
 * appearance themes so the installed window title bar matches the app.
 */
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();
  const { activeTheme } = useThemeConfig();

  React.useEffect(() => {
    const meta =
      document.querySelector('meta[name="theme-color"]') ??
      (() => {
        const el = document.createElement('meta');
        el.setAttribute('name', 'theme-color');
        document.head.appendChild(el);
        return el;
      })();

    const isDark =
      resolvedTheme === 'dark' ||
      activeTheme === 'discord' ||
      activeTheme === 'mono' ||
      document.documentElement.classList.contains('dark');

    meta.setAttribute('content', isDark ? PWA_THEME_COLOR_DARK : PWA_THEME_COLOR_LIGHT);
  }, [resolvedTheme, activeTheme]);

  return null;
}
