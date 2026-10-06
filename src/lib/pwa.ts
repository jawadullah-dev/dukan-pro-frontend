/** Clear service-worker runtime caches (call on logout). */
export async function clearPwaCaches(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    // ignore
  }

  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    reg?.active?.postMessage({ type: 'CLEAR_RUNTIME_CACHES' });
  } catch {
    // ignore
  }
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia('(display-mode: standalone)').matches;
  const ios =
    'standalone' in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || ios;
}

export function isIosSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const chromeIos = /CriOS|FxiOS|EdgiOS/.test(ua);
  return iOS && webkit;
}

/** True for any iOS browser that needs Add to Home Screen (Safari share sheet). */
export function isIosInstallCandidate(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}
