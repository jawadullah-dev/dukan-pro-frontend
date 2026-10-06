'use client';

import type { ReactNode } from 'react';
import { SerwistProvider } from '@/components/pwa/serwist-provider';
import { ThemeColorSync } from '@/components/pwa/theme-color-sync';
import { PwaUpdateBanner } from '@/components/pwa/pwa-update-banner';
import { OfflineBanner } from '@/components/pwa/offline-banner';
import { InstallPrompt } from '@/components/pwa/install-prompt';

const enableSw = process.env.NODE_ENV === 'production';

/** Registers SW (prod only) and mounts install / update / offline UI. */
export function PwaShell({ children }: { children: ReactNode }) {
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

  return (
    <SerwistProvider swUrl='/serwist/sw.js' disable={false} reloadOnOnline={false}>
      {body}
    </SerwistProvider>
  );
}
