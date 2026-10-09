'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { useTranslations } from 'next-intl';
import { isIosInstallCandidate, isStandaloneDisplay } from '@/lib/pwa';
import {
  AUTO_PROMPT_KEY,
  bumpInstallVisitsOnce,
  canPromptNativeInstall,
  clearInstalledMark,
  detectPwaAlreadyInstalled,
  ensureInstallListeners,
  getBrowserAppsUrl,
  isDesktopInstallSurface,
  isInstallMarkedInstalled,
  isInstallPrompting,
  promptNativeInstall,
  subscribeInstallState,
  waitAndPromptNativeInstall
} from '@/lib/pwa-install';
import { cn } from '@/lib/utils';

const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_DAYS = 14;
const MIN_VISITS = 2;

type Surface = 'ios' | 'android' | 'desktop';

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

function resolveSurface(): Surface {
  if (isIosInstallCandidate()) return 'ios';
  if (isDesktopInstallSurface()) return 'desktop';
  return 'android';
}

function takeAutoPromptFlag(): boolean {
  try {
    if (sessionStorage.getItem(AUTO_PROMPT_KEY) !== '1') return false;
    sessionStorage.removeItem(AUTO_PROMPT_KEY);
    return true;
  } catch {
    return false;
  }
}

function setAutoPromptFlag(): void {
  try {
    sessionStorage.setItem(AUTO_PROMPT_KEY, '1');
  } catch {}
}

interface InstallPromptProps {
  variant?: 'banner' | 'menu' | 'both';
  className?: string;
}

export function InstallPrompt({ variant = 'both', className }: InstallPromptProps) {
  const t = useTranslations();
  const [standalone, setStandalone] = React.useState(false);
  const [alreadyInstalled, setAlreadyInstalled] = React.useState(false);
  const [canPrompt, setCanPrompt] = React.useState(false);
  const [prompting, setPrompting] = React.useState(false);
  const [showBanner, setShowBanner] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [needsReinstall, setNeedsReinstall] = React.useState(false);
  const [stillInstalledHint, setStillInstalledHint] = React.useState(false);
  const [eligible, setEligible] = React.useState(false);
  const [surface, setSurface] = React.useState<Surface>('desktop');
  const [appsUrl, setAppsUrl] = React.useState('chrome://apps');
  const autoPromptTried = React.useRef(false);

  React.useEffect(() => {
    if (isStandaloneDisplay()) {
      setStandalone(true);
      return;
    }

    ensureInstallListeners();
    setSurface(resolveSurface());
    setAppsUrl(getBrowserAppsUrl());
    const visits = bumpInstallVisitsOnce();
    setEligible(visits >= MIN_VISITS && !readDismissed());
    setCanPrompt(canPromptNativeInstall());
    setPrompting(isInstallPrompting());
    setAlreadyInstalled(isInstallMarkedInstalled());

    void detectPwaAlreadyInstalled().then((yes) => {
      if (yes) setAlreadyInstalled(true);
    });

    return subscribeInstallState(() => {
      setStandalone(isStandaloneDisplay());
      setAlreadyInstalled(isInstallMarkedInstalled());
      setCanPrompt(canPromptNativeInstall());
      setPrompting(isInstallPrompting());
    });
  }, []);

  React.useEffect(() => {
    if (standalone || surface === 'ios' || autoPromptTried.current) return;
    if (!takeAutoPromptFlag()) return;
    autoPromptTried.current = true;

    void (async () => {
      clearInstalledMark();
      setPrompting(true);
      const outcome = await waitAndPromptNativeInstall(5000);
      setPrompting(false);

      if (outcome === 'accepted') {
        setAlreadyInstalled(true);
        toast.success(t('pwa.installSuccess'));
        return;
      }

      const stillThere = await detectPwaAlreadyInstalled();
      setStillInstalledHint(stillThere);
      setNeedsReinstall(true);
      setHelpOpen(true);
      if (stillThere) {
        toast.error(t('pwa.stillInstalledToast'));
      } else {
        toast.message(t('pwa.useBrowserInstallMenu'));
      }
    })();
  }, [standalone, surface]);

  React.useEffect(() => {
    if (!eligible || standalone) return;
    if (variant === 'menu') return;
    const timer = window.setTimeout(() => setShowBanner(true), 2500);
    return () => window.clearTimeout(timer);
  }, [eligible, standalone, variant]);

  const dismissBanner = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setShowBanner(false);
    setEligible(false);
  };

  const openHelp = (reinstall: boolean) => {
    setNeedsReinstall(reinstall);
    setStillInstalledHint(false);
    setHelpOpen(true);
  };

  const finishAccepted = () => {
    setShowBanner(false);
    setHelpOpen(false);
    setAlreadyInstalled(true);
    setNeedsReinstall(false);
    setStillInstalledHint(false);
    toast.success(t('pwa.installSuccess'));
  };

  const tryNativeInstall = () => {
    void promptNativeInstall().then(async (outcome) => {
      if (outcome === 'accepted') {
        finishAccepted();
        return;
      }
      if (outcome === 'dismissed') {
        toast.message(t('pwa.installCancelled'));
        return;
      }
      const stillThere = await detectPwaAlreadyInstalled();
      setStillInstalledHint(stillThere);
      openHelp(true);
    });
  };

  const onInstallClick = () => {
    if (surface === 'ios') {
      openHelp(alreadyInstalled);
      return;
    }

    if (canPromptNativeInstall() || canPrompt) {
      tryNativeInstall();
      return;
    }

    openHelp(true);
  };

  const copyAppsUrl = async () => {
    try {
      await navigator.clipboard.writeText(appsUrl);
      toast.success(t('pwa.copiedAppsUrl'));
    } catch {
      toast.message(appsUrl);
    }
  };

  const onRemovedAndInstall = () => {
    if (surface === 'ios') {
      openHelp(false);
      return;
    }

    clearInstalledMark();
    setAlreadyInstalled(false);

    if (canPromptNativeInstall()) {
      tryNativeInstall();
      return;
    }

    setAutoPromptFlag();
    toast.message(t('pwa.reloadingForInstall'));
    window.setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  if (standalone) return null;

  const showMenu = variant === 'menu' || variant === 'both';
  const showBannerUi = (variant === 'banner' || variant === 'both') && showBanner && eligible;

  const menuLabel = prompting
    ? t('pwa.installing')
    : alreadyInstalled
      ? t('pwa.removeAndNewIcon')
      : t('pwa.installApp');

  const helpTitle = needsReinstall
    ? stillInstalledHint
      ? t('pwa.stillInstalledTitle')
      : t('pwa.removeAndNewTitle')
    : surface === 'ios'
      ? t('pwa.iosTitle')
      : surface === 'desktop'
        ? t('pwa.desktopTitle')
        : t('pwa.androidTitle');

  const helpBody = needsReinstall
    ? stillInstalledHint
      ? t('pwa.stillInstalledBody')
      : surface === 'ios'
        ? t('pwa.againBodyIos')
        : surface === 'desktop'
          ? t('pwa.removeAndNewBodyDesktop')
          : t('pwa.removeAndNewBodyAndroid')
    : surface === 'ios'
      ? t('pwa.iosBody')
      : surface === 'desktop'
        ? t('pwa.desktopBody')
        : t('pwa.androidBody');

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
          {menuLabel}
        </button>
      ) : null}

      {showBannerUi ? (
        <div
          role='region'
          aria-label={menuLabel}
          className='border-border bg-card fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 rounded-xl border p-3 shadow-lg sm:inset-x-auto sm:end-4 sm:bottom-4 sm:max-w-sm'
        >
          <p className='text-sm font-medium'>
            {alreadyInstalled ? t('pwa.removeAndNewIcon') : t('pwa.installApp')}
          </p>
          <p className='text-muted-foreground mt-1 text-xs'>
            {alreadyInstalled
              ? t('pwa.removeAndNewBanner')
              : surface === 'ios'
                ? t('pwa.iosBody')
                : surface === 'desktop'
                  ? t('pwa.installDesktopHint')
                  : t('pwa.androidBody')}
          </p>
          <div className='mt-3 flex gap-2'>
            <Button
              type='button'
              size='sm'
              className='flex-1'
              onClick={onInstallClick}
              isLoading={prompting}
            >
              {surface === 'ios' && !alreadyInstalled
                ? t('pwa.howToInstall')
                : alreadyInstalled
                  ? t('pwa.removeAndNewIcon')
                  : t('pwa.installApp')}
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
            <DialogTitle>{helpTitle}</DialogTitle>
            <DialogDescription>{helpBody}</DialogDescription>
          </DialogHeader>

          <ol className='text-muted-foreground list-decimal space-y-2 ps-4 text-sm'>
            {needsReinstall ? (
              surface === 'ios' ? (
                <>
                  <li>{t('pwa.againIosStep1')}</li>
                  <li>{t('pwa.againIosStep2')}</li>
                  <li>{t('pwa.againIosStep3')}</li>
                </>
              ) : surface === 'desktop' ? (
                <>
                  <li>
                    {t('pwa.againDesktopStep1Prefix')}{' '}
                    <span className='text-foreground font-medium'>{appsUrl}</span>
                  </li>
                  <li>{t('pwa.againDesktopStep2')}</li>
                  <li>{t('pwa.againDesktopStep3')}</li>
                  <li>{t('pwa.againDesktopStep4')}</li>
                </>
              ) : (
                <>
                  <li>{t('pwa.againAndroidStep1')}</li>
                  <li>{t('pwa.againAndroidStep2')}</li>
                  <li>{t('pwa.againAndroidStep3')}</li>
                  <li>{t('pwa.againAndroidStep4')}</li>
                </>
              )
            ) : surface === 'ios' ? (
              <>
                <li>{t('pwa.iosStep1')}</li>
                <li>{t('pwa.iosStep2')}</li>
                <li>{t('pwa.iosStep3')}</li>
              </>
            ) : surface === 'desktop' ? (
              <>
                <li>{t('pwa.desktopStep1')}</li>
                <li>{t('pwa.desktopStep2')}</li>
                <li>{t('pwa.desktopStep3')}</li>
              </>
            ) : (
              <>
                <li>{t('pwa.androidStep1')}</li>
                <li>{t('pwa.androidStep2')}</li>
                <li>{t('pwa.androidStep3')}</li>
              </>
            )}
          </ol>

          {needsReinstall && surface !== 'ios' ? (
            <div className='mt-3 flex flex-col gap-2'>
              <Button
                type='button'
                variant='outline'
                className='w-full'
                onClick={() => void copyAppsUrl()}
              >
                {t('pwa.copyAppsUrl')}
              </Button>
              <Button
                type='button'
                className='w-full'
                isLoading={prompting}
                onClick={onRemovedAndInstall}
              >
                {canPrompt ? t('pwa.createNewIcon') : t('pwa.reloadAndInstall')}
              </Button>
            </div>
          ) : null}

          {needsReinstall && surface === 'ios' ? (
            <Button type='button' className='mt-3 w-full' onClick={() => openHelp(false)}>
              {t('pwa.howToInstall')}
            </Button>
          ) : null}

          {!needsReinstall && surface !== 'ios' ? (
            <Button
              type='button'
              className='mt-2 w-full'
              isLoading={prompting}
              disabled={!canPrompt && !prompting}
              onClick={tryNativeInstall}
            >
              {canPrompt || prompting ? t('pwa.installApp') : t('pwa.installUnavailable')}
            </Button>
          ) : null}

          <p className='text-muted-foreground mt-2 text-center text-xs'>
            {needsReinstall ? t('pwa.againFooter') : t('pwa.installFooter')}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
