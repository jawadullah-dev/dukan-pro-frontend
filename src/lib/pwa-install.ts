/**
 * Shared install-prompt state for multiple InstallPrompt mounts
 * (banner + menu + settings). Chrome fires `beforeinstallprompt` once;
 * only one caller may invoke `prompt()` at a time.
 */

import { isStandaloneDisplay } from '@/lib/pwa';

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type Listener = () => void;

const INSTALLED_FLAG_KEY = 'pwa-app-installed';
/** Set before reload — next page load auto-opens the native install dialog. */
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
    // ignore
  }
}

export function subscribeInstallState(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return deferred;
}

export function isInstallMarkedInstalled(): boolean {
  return installed || readInstalledFlag();
}

/** After the user uninstalls in Chrome, call this so Install can show again. */
export function clearInstalledMark(): void {
  installed = false;
  try {
    localStorage.removeItem(INSTALLED_FLAG_KEY);
  } catch {
    // ignore
  }
  emit();
}

export function isInstallPrompting(): boolean {
  return prompting;
}

/** True when Chromium can show the native install UI right now. */
export function canPromptNativeInstall(): boolean {
  return Boolean(deferred) && !prompting && !installed;
}

/** Call once from any InstallPrompt mount — safe if called many times. */
export function ensureInstallListeners(): void {
  if (typeof window === 'undefined' || bound) return;
  bound = true;

  if (readInstalledFlag()) {
    installed = true;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    // Fresh BIP means the browser can install again (e.g. after uninstall).
    installed = false;
    try {
      localStorage.removeItem(INSTALLED_FLAG_KEY);
    } catch {
      // ignore
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

// Capture BIP as early as this module loads (before React mounts).
ensureInstallListeners();

/** Bump visit counter once per full page load (not per component mount). */
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

/**
 * Show the native Chromium install UI (desktop + Android Chrome).
 * That dialog is what creates the Start menu / desktop icon (like home screen on phone).
 * Safe to call repeatedly — never throws to the UI.
 */
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

/** Desktop Chromium / wide viewport — not iPhone-style install. */
export function isDesktopInstallSurface(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(min-width: 640px)').matches;
}

type RelatedApp = { platform: string; url?: string; id?: string };

/**
 * True when Chrome already installed this PWA (address bar shows "Open in app").
 * In that case BIP will not fire — user needs a desktop shortcut, not another install.
 */
export async function detectPwaAlreadyInstalled(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (isStandaloneDisplay()) return true;

  try {
    const nav = navigator as Navigator & {
      getInstalledRelatedApps?: () => Promise<RelatedApp[]>;
    };
    if (typeof nav.getInstalledRelatedApps === 'function') {
      const apps = await nav.getInstalledRelatedApps();
      if (apps.some((app) => app.platform === 'webapp')) {
        installed = true;
        writeInstalledFlag();
        emit();
        return true;
      }
      // API says not installed — clear a stale local flag from a deleted shortcut.
      installed = false;
      try {
        localStorage.removeItem(INSTALLED_FLAG_KEY);
      } catch {
        // ignore
      }
      emit();
      return false;
    }
  } catch {
    // ignore
  }

  // Fallback when the browser cannot report related apps.
  return installed || readInstalledFlag();
}

/** Chrome / Edge apps page URL for uninstalling the PWA. */
export function getBrowserAppsUrl(): string {
  if (typeof navigator === 'undefined') return 'chrome://apps';
  return /Edg\//.test(navigator.userAgent) ? 'edge://apps' : 'chrome://apps';
}

/**
 * Wait briefly for beforeinstallprompt, then open the native install UI.
 * Used after "I removed it" reloads the page.
 */
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
