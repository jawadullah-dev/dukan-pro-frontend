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
import {
  bumpInstallVisitsOnce,
  ensureInstallListeners,
  getDeferredPrompt,
  isInstallMarkedInstalled,
  isInstallPrompting,
  promptNativeInstall,
  subscribeInstallState
} from '@/lib/pwa-install';
import { cn } from '@/lib/utils';

const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_DAYS = 14;
const MIN_VISITS = 2;

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

interface InstallPromptProps {
  /** Render as menu item only (no banner). */
  variant?: 'banner' | 'menu' | 'both';
  className?: string;
}

/**
 * Install entry points (banner + menu). Open/close/cancel as many times as you
 * want — never crashes; falls back to how-to dialog when the native prompt
 * was already used or dismissed.
 */
export function InstallPrompt({ variant = 'both', className }: InstallPromptProps) {
  const [installed, setInstalled] = React.useState(false);
  const [hasDeferred, setHasDeferred] = React.useState(false);
  const [prompting, setPrompting] = React.useState(false);
  const [showBanner, setShowBanner] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [eligible, setEligible] = React.useState(false);
  const ios = isIosInstallCandidate();

  React.useEffect(() => {
    if (isStandaloneDisplay() || isInstallMarkedInstalled()) {
      setInstalled(true);
      return;
    }

    ensureInstallListeners();
    const visits = bumpInstallVisitsOnce();
    setEligible(visits >= MIN_VISITS && !readDismissed());
    setHasDeferred(Boolean(getDeferredPrompt()));
    setPrompting(isInstallPrompting());

    return subscribeInstallState(() => {
      setInstalled(isInstallMarkedInstalled() || isStandaloneDisplay());
      setHasDeferred(Boolean(getDeferredPrompt()));
      setPrompting(isInstallPrompting());
    });
  }, []);

  React.useEffect(() => {
    if (!eligible || installed) return;
    if (variant === 'menu') return;
    const timer = window.setTimeout(() => setShowBanner(true), 2500);
    return () => window.clearTimeout(timer);
  }, [eligible, installed, variant]);

  const dismissBanner = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setShowBanner(false);
    setEligible(false);
  };

  const openHelp = () => {
    setHelpOpen(true);
  };

  const onInstallClick = () => {
    // iOS never gets beforeinstallprompt — always show Share steps.
    if (ios) {
      openHelp();
      return;
    }

    // Native prompt available — show it. Closing without install is fine;
    // the next tap opens the how-to dialog (BIP is one-shot per session).
    if (hasDeferred && !prompting) {
      void promptNativeInstall().then((outcome) => {
        if (outcome === 'accepted') {
          setShowBanner(false);
          setHelpOpen(false);
        }
      });
      return;
    }

    // Already used native prompt this session, or browser has no BIP — show steps.
    openHelp();
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
          onClick={onInstallClick}
          disabled={prompting}
        >
          <Icons.download className='size-4' />
          {prompting ? t('pwa.installing') : t('pwa.installApp')}
        </button>
      ) : null}

      {showBannerUi ? (
        <div
          role='region'
          aria-label={t('pwa.installApp')}
          className='border-border bg-card fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 rounded-xl border p-3 shadow-lg sm:inset-x-auto sm:end-4 sm:bottom-4 sm:max-w-sm'
        >
          <p className='text-sm font-medium'>{t('pwa.installApp')}</p>
          <p className='text-muted-foreground mt-1 text-xs'>
            {ios ? t('pwa.iosBody') : t('pwa.installDesktopHint')}
          </p>
          <div className='mt-3 flex gap-2'>
            <Button
              type='button'
              size='sm'
              className='flex-1'
              onClick={onInstallClick}
              isLoading={prompting}
            >
              {ios || !hasDeferred ? t('pwa.howToInstall') : t('pwa.installApp')}
            </Button>
            <Button type='button' size='sm' variant='ghost' onClick={dismissBanner}>
              {t('pwa.dismiss')}
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>{ios ? t('pwa.iosTitle') : t('pwa.androidTitle')}</DialogTitle>
            <DialogDescription>{ios ? t('pwa.iosBody') : t('pwa.androidBody')}</DialogDescription>
          </DialogHeader>
          <ol className='text-muted-foreground list-decimal space-y-2 ps-4 text-sm'>
            {ios ? (
              <>
                <li>{t('pwa.iosStep1')}</li>
                <li>{t('pwa.iosStep2')}</li>
                <li>{t('pwa.iosStep3')}</li>
              </>
            ) : (
              <>
                <li>{t('pwa.androidStep1')}</li>
                <li>{t('pwa.androidStep2')}</li>
                <li>{t('pwa.androidStep3')}</li>
              </>
            )}
          </ol>
          {!ios && hasDeferred ? (
            <Button
              type='button'
              className='mt-2 w-full'
              isLoading={prompting}
              onClick={() => {
                void promptNativeInstall().then((outcome) => {
                  if (outcome === 'accepted') setHelpOpen(false);
                });
              }}
            >
              {t('pwa.installApp')}
            </Button>
          ) : null}
          <div
            className='bg-muted text-muted-foreground mt-2 flex h-20 items-center justify-center rounded-lg px-3 text-center text-xs'
            aria-hidden
          >
            {ios ? 'Share → Add to Home Screen' : 'Browser menu ⋮ → Install app'}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
