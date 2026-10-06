'use client';

import * as React from 'react';
import { t } from '@/i18n';

/** Slim banner when the device goes offline. */
export function OfflineBanner() {
  const [offline, setOffline] = React.useState(false);

  React.useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role='status'
      aria-live='polite'
      className='bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-b border-border px-4 py-1.5 text-center text-xs font-medium'
    >
      {t('pwa.offlineBanner')}
    </div>
  );
}

/** Hook for disabling forms while offline. */
export function useIsOnline(): boolean {
  const [online, setOnline] = React.useState(true);
  React.useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);
  return online;
}
