'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { t } from '@/i18n';
import { isIosInstallCandidate, isStandaloneDisplay } from '@/lib/pwa';
import { cn } from '@/lib/utils';

const DISMISS_KEY = 'pwa-install-dismissed-at';
const VISIT_KEY = 'pwa-install-visits';
const DISMISS_DAYS = 14;
const MIN_VISITS = 2;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function readDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function bumpVisits(): number {
  try {
    const n = Number(localStorage.getItem(VISIT_KEY) ?? '0') + 1;
    localStorage.setItem(VISIT_KEY, String(n));
    return n;
  } catch {
    return MIN_VISITS;
  }
}

interface InstallPromptProps {
  /** Render as menu item only (no banner). */
  variant?: 'banner' | 'menu' | 'both';
  className?: string;
}

export function InstallPrompt({ variant = 'both', className }: InstallPromptProps) {
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = React.useState(false);
  const [showBanner, setShowBanner] = React.useState(false);
  const [iosOpen, setIosOpen] = React.useState(false);
  const [eligible, setEligible] = React.useState(false);

  React.useEffect(() => {
    if (isStandaloneDisplay()) {
      setInstalled(true);
      return;
    }

    const visits = bumpVisits();
    const dismissed = readDismissed();
    setEligible(visits >= MIN_VISITS && !dismissed);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  React.useEffect(() => {
    if (!eligible || installed) return;
    if (variant === 'menu') return;
    // Never on first visit; wait a beat after login/shell mount
    const timer = window.setTimeout(() => setShowBanner(true), 2500);
    return () => window.clearTimeout(timer);
  }, [eligible, installed, variant]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setShowBanner(false);
    setEligible(false);
  };

  const installChromium = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShowBanner(false);
  };

  const openHelp = () => {
    if (isIosInstallCandidate()) {
      setIosOpen(true);
      return;
    }
    void installChromium();
  };

  if (installed) return null;

  const showMenu = variant === 'menu' || variant === 'both';
  const showBannerUi = (variant === 'banner' || variant === 'both') && showBanner && eligible;

  return (
    <>
      {showMenu ? (
        <button
          type='button'
          className={cn(
            'hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm',
            className
          )}
          onClick={openHelp}
        >
          <Icons.download className='size-4' />
          {t('pwa.installApp')}
        </button>
      ) : null}

      {showBannerUi ? (
        <div
          role='region'
          aria-label={t('pwa.installApp')}
          className='border-border bg-card fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 rounded-xl border p-3 shadow-lg sm:inset-x-auto sm:end-4 sm:bottom-4 sm:max-w-sm'
        >
          <p className='text-sm font-medium'>{t('pwa.installApp')}</p>
          <p className='text-muted-foreground mt-1 text-xs'>{t('pwa.installDesktopHint')}</p>
          <div className='mt-3 flex gap-2'>
            <Button type='button' size='sm' className='flex-1' onClick={openHelp}>
              {isIosInstallCandidate() ? t('pwa.howToInstall') : t('pwa.installApp')}
            </Button>
            <Button type='button' size='sm' variant='ghost' onClick={dismiss}>
              {t('pwa.dismiss')}
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={iosOpen} onOpenChange={setIosOpen}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>{t('pwa.iosTitle')}</DialogTitle>
            <DialogDescription>{t('pwa.iosBody')}</DialogDescription>
          </DialogHeader>
          <ol className='text-muted-foreground list-decimal space-y-2 ps-4 text-sm'>
            <li>{t('pwa.iosStep1')}</li>
            <li>{t('pwa.iosStep2')}</li>
            <li>{t('pwa.iosStep3')}</li>
          </ol>
          <div
            className='bg-muted text-muted-foreground mt-2 flex h-28 items-center justify-center rounded-lg text-xs'
            aria-hidden
          >
            Share → Add to Home Screen
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
