'use client';
import { ActiveThemeProvider } from '@/components/themes/active-theme';
import QueryProvider from '@/components/layout/query-provider';
import { AuthProvider } from '@/components/layout/auth-provider';
import { AppearanceProvider } from '@/components/appearance/appearance-provider';
import type { ProvidersProps } from '@/types';

export default function Providers({ activeThemeValue, children }: ProvidersProps) {
  return (
    <ActiveThemeProvider initialTheme={activeThemeValue}>
      <AppearanceProvider>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </AppearanceProvider>
    </ActiveThemeProvider>
  );
}
