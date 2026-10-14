'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { env } from '@/config/env';

export function PwaUpdateBanner() {
  const t = useTranslations();

  const updateLabel = t('pwa.updateAvailable');
  const reloadLabel = t('pwa.reload');

  React.useEffect(() => {
    if (env.NODE_ENV !== 'production') return;
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

    const onControllerChange = () => {};
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
