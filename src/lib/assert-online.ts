'use client';

import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

/** Block save/submit while offline — no silent queueing. */
export function useAssertOnline() {
  const t = useTranslations();
  return function assertOnlineOrToast(): boolean {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error(t('pwa.offlineBlock'));
      return false;
    }
    return true;
  };
}
