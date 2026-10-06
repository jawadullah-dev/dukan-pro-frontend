'use client';

import { toast } from 'sonner';
import { t } from '@/i18n';

/** Block save/submit while offline — no silent queueing. */
export function assertOnlineOrToast(): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    toast.error(t('pwa.offlineBlock'));
    return false;
  }
  return true;
}
