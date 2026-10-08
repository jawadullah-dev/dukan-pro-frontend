'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

function isChunkLoadError(error: Error): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    /Loading chunk [\d]+ failed/i.test(error.message) ||
    /Failed to fetch dynamically imported module/i.test(error.message)
  );
}

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    Sentry.captureException(error);
    if (isChunkLoadError(error)) {
      const key = 'pwa-chunk-reload';
      try {
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <main className='flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center'>
      <h1 className='text-lg font-semibold'>{t('errors.screenLoadTitle')}</h1>
      <p className='text-muted-foreground max-w-sm text-sm'>{t('errors.screenLoadDescription')}</p>
      <Button
        type='button'
        onClick={() => {
          try {
            sessionStorage.removeItem('pwa-chunk-reload');
          } catch {
            // ignore
          }
          reset();
          window.location.reload();
        }}
      >
        {t('errors.reload')}
      </Button>
    </main>
  );
}
