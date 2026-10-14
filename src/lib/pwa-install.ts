import { isStandaloneDisplay } from '@/lib/pwa';
import type { BeforeInstallPromptEvent, NavigatorWithRelatedApps } from '@/types/common';

type Listener = () => void;

const INSTALLED_FLAG_KEY = 'pwa-app-installed';
export const AUTO_PROMPT_KEY = 'pwa-auto-prompt-install';

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
let prompting = false;
let visitsBumped = false;
let bound = false;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

function readInstalledFlag(): boolean {
  try {
    return localStorage.getItem(INSTALLED_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

function writeInstalledFlag(): void {
  try {
    localStorage.setItem(INSTALLED_FLAG_KEY, '1');
  } catch {
    installed = true;
  }
}

export function subscribeInstallState(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isInstallMarkedInstalled(): boolean {
  return installed || readInstalledFlag();
}

export function clearInstalledMark(): void {
  installed = false;
  try {
    localStorage.removeItem(INSTALLED_FLAG_KEY);
  } catch {
    installed = false;
  }
  emit();
}

export function isInstallPrompting(): boolean {
  return prompting;
}

export function canPromptNativeInstall(): boolean {
  return Boolean(deferred) && !prompting && !installed;
}

export function ensureInstallListeners(): void {
  if (typeof window === 'undefined' || bound) return;
  bound = true;

  if (readInstalledFlag()) {
    installed = true;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;

    installed = false;
    try {
      localStorage.removeItem(INSTALLED_FLAG_KEY);
    } catch {
      installed = false;
    }
    emit();
  });

  window.addEventListener('appinstalled', () => {
    installed = true;
    deferred = null;
    prompting = false;
    writeInstalledFlag();
    emit();
  });
}

ensureInstallListeners();

export function bumpInstallVisitsOnce(): number {
  if (typeof window === 'undefined') return 0;
  try {
    if (visitsBumped) {
      return Number(localStorage.getItem('pwa-install-visits') ?? '0');
    }
    visitsBumped = true;
    const n = Number(localStorage.getItem('pwa-install-visits') ?? '0') + 1;
    localStorage.setItem('pwa-install-visits', String(n));
    return n;
  } catch {
    return 2;
  }
}

export async function promptNativeInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (prompting) return 'unavailable';
  const event = deferred;
  if (!event) return 'unavailable';

  prompting = true;
  emit();

  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    deferred = null;
    if (outcome === 'accepted') {
      installed = true;
      writeInstalledFlag();
    }
    return outcome;
  } catch {
    deferred = null;
    return 'dismissed';
  } finally {
    prompting = false;
    emit();
  }
}

export function isDesktopInstallSurface(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(min-width: 640px)').matches;
}

export async function detectPwaAlreadyInstalled(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (isStandaloneDisplay()) return true;

  try {
    const nav = navigator as NavigatorWithRelatedApps;
    if (typeof nav.getInstalledRelatedApps === 'function') {
      const apps = await nav.getInstalledRelatedApps();
      if (apps.some((app) => app.platform === 'webapp')) {
        installed = true;
        writeInstalledFlag();
        emit();
        return true;
      }

      installed = false;
      try {
        localStorage.removeItem(INSTALLED_FLAG_KEY);
      } catch {
        installed = false;
      }
      emit();
      return false;
    }
  } catch {
    return installed || readInstalledFlag();
  }

  return installed || readInstalledFlag();
}

export function getBrowserAppsUrl(): string {
  if (typeof navigator === 'undefined') return 'chrome://apps';
  return navigator.userAgent.includes('Edg') ? 'edge://apps' : 'chrome://apps';
}

export async function waitAndPromptNativeInstall(
  timeoutMs = 4000
): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  ensureInstallListeners();

  if (canPromptNativeInstall()) {
    return promptNativeInstall();
  }

  const started = Date.now();
  return new Promise((resolve) => {
    const finish = async () => {
      unsubscribe();
      window.clearInterval(timer);
      resolve(await promptNativeInstall());
    };

    const unsubscribe = subscribeInstallState(() => {
      if (canPromptNativeInstall()) {
        void finish();
      }
    });

    const timer = window.setInterval(() => {
      if (canPromptNativeInstall()) {
        void finish();
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        unsubscribe();
        window.clearInterval(timer);
        resolve('unavailable');
      }
    }, 150);
  });
}
