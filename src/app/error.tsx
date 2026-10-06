'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';

function isChunkLoadError(error: Error): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    /Loading chunk [\d]+ failed/i.test(error.message) ||
    /Failed to fetch dynamically imported module/i.test(error.message)
  );
}

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    if (isChunkLoadError(error)) {
      // Stale PWA cache after deploy — hard reload once.
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
    <main className='bg-background text-foreground flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center'>
      <h1 className='text-xl font-semibold'>Something went wrong</h1>
      <p className='text-muted-foreground max-w-sm text-sm'>
        The page failed to load. Check your connection, then try again.
      </p>
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
        Reload
      </Button>
    </main>
  );
}
