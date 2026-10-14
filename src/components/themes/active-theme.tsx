'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { AppError } from '@/lib/errors';
import { DEFAULT_THEME } from './theme.config';
import type { ThemeContextType, ActiveThemeProviderProps } from '@/types';
export type { ActiveThemeProviderProps };

const COOKIE_NAME = 'active_theme';

function setThemeCookie(theme: string) {
  if (typeof window === 'undefined') return;

  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax; ${window.location.protocol === 'https:' ? 'Secure;' : ''}`;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ActiveThemeProvider({ children, initialTheme }: ActiveThemeProviderProps) {
  const themeToUse = initialTheme || DEFAULT_THEME;
  const [activeTheme, setActiveTheme] = useState<string>(themeToUse);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme !== activeTheme) {
      setThemeCookie(activeTheme);

      document.documentElement.removeAttribute('data-theme');

      Array.from(document.body.classList)
        .filter((className) => className.startsWith('theme-'))
        .forEach((className) => {
          document.body.classList.remove(className);
        });

      if (activeTheme) {
        document.documentElement.setAttribute('data-theme', activeTheme);
      }
    } else {
      setThemeCookie(activeTheme);
    }
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeConfig() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new AppError('useThemeConfig must be used within an ActiveThemeProvider');
  }
  return context;
}
