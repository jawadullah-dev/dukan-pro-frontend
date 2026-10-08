'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

/**
 * Shows a toast when a waiting service worker is ready.
 * Does not auto-reload (avoids interrupting sales/forms).
 */
export function PwaUpdateBanner() {
  const t = useTranslations();
  // Capture translation strings before the effect so they're stable
  const updateLabel = t('pwa.updateAvailable');
  const reloadLabel = t('pwa.reload');

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;
    let shown = false;

    const promptUpdate = (reg: ServiceWorkerRegistration) => {
      if (!reg.waiting || shown) return;
      shown = true;
      toast(updateLabel, {
        duration: Infinity,
        action: {
          label: reloadLabel,
          onClick: () => {
            reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
            // Reload after the new worker takes control
            navigator.serviceWorker.addEventListener(
              'controllerchange',
              () => {
                window.location.reload();
              },
              { once: true }
            );
          }
        }
      });
    };

    void navigator.serviceWorker.ready.then((reg) => {
      registration = reg;
      promptUpdate(reg);
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            promptUpdate(reg);
          }
        });
      });
    });

    const onControllerChange = () => {
      // handled by reload on user action
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const interval = window.setInterval(
      () => {
        void registration?.update();
      },
      60 * 60 * 1000
    );

    return () => {
      window.clearInterval(interval);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, [updateLabel, reloadLabel]);

  return null;
}

/** Compact inline banner alternative (optional mount). */
export function PwaUpdateInline({ onReload }: { onReload: () => void }) {
  const t = useTranslations();
  return (
    <div
      role='status'
      className='bg-primary text-primary-foreground flex items-center justify-between gap-3 px-4 py-2 text-sm'
    >
      <span>{t('pwa.updateAvailable')}</span>
      <Button type='button' size='sm' variant='secondary' onClick={onReload}>
        {t('pwa.reload')}
      </Button>
    </div>
  );
}
