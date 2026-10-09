'use client';
import React from 'react';
import { ActiveThemeProvider } from '@/components/themes/active-theme';
import QueryProvider from '@/components/layout/query-provider';
import { AuthProvider } from '@/components/layout/auth-provider';
import { AppearanceProvider } from '@/components/appearance/appearance-provider';

interface ProvidersProps {
  activeThemeValue: string;
  children: React.ReactNode;
}

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
