'use client';

import type { ReactNode } from 'react';
import { SerwistProvider } from '@/components/pwa/serwist-provider';
import { ThemeColorSync } from '@/components/pwa/theme-color-sync';
import { PwaUpdateBanner } from '@/components/pwa/pwa-update-banner';
import { OfflineBanner } from '@/components/pwa/offline-banner';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { env } from '@/config/env';

const enableSw = env.NODE_ENV === 'production';

export interface PwaShellProps {
  children: ReactNode;
}

export function PwaShell({ children }: PwaShellProps) {
  const body = (
    <>
      <ThemeColorSync />
      <OfflineBanner />
      <PwaUpdateBanner />
      <InstallPrompt variant='banner' />
      {children}
    </>
  );

  if (!enableSw) {
    return body;
  }

  return <SerwistProvider swUrl='/sw.js'>{body}</SerwistProvider>;
}
