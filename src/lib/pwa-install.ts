/**
 * Shared install-prompt state for multiple InstallPrompt mounts
 * (banner + menu + settings). Chrome fires `beforeinstallprompt` once;
 * only one caller may invoke `prompt()` at a time.
 */

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type Listener = () => void;

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
let prompting = false;
let visitsBumped = false;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
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
  return installed;
}

export function isInstallPrompting(): boolean {
  return prompting;
}

/** Call once from any InstallPrompt mount — safe if called many times. */
export function ensureInstallListeners(): void {
  if (typeof window === 'undefined') return;
  const w = window as Window & { __dukaanInstallBound?: boolean };
  if (w.__dukaanInstallBound) return;
  w.__dukaanInstallBound = true;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });

  window.addEventListener('appinstalled', () => {
    installed = true;
    deferred = null;
    prompting = false;
    emit();
  });
}

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
 * Show the native Chromium install UI. Safe to call repeatedly:
 * - ignores double-taps while open
 * - never throws to the UI
 * - clears the one-shot event after accept/dismiss
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
    }
    return outcome;
  } catch {
    // User closed dialog mid-flight, or prompt already used — stay quiet.
    deferred = null;
    return 'dismissed';
  } finally {
    prompting = false;
    emit();
  }
}
