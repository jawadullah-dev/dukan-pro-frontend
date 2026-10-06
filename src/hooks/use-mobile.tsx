import * as React from 'react';

/** Matches plan: off-canvas shell below 1024px (sidebar + bottom nav phones). */
export const MOBILE_BREAKPOINT = 1024;

function subscribeMaxWidth(maxPx: number, onStoreChange: () => void) {
  const mql = window.matchMedia(`(max-width: ${maxPx}px)`);
  mql.addEventListener('change', onStoreChange);
  return () => mql.removeEventListener('change', onStoreChange);
}

function getMaxWidthSnapshot(maxPx: number) {
  return window.matchMedia(`(max-width: ${maxPx}px)`).matches;
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    (onStoreChange) => subscribeMaxWidth(MOBILE_BREAKPOINT - 1, onStoreChange),
    () => getMaxWidthSnapshot(MOBILE_BREAKPOINT - 1),
    () => false
  );
}

/** True below 640px — phone bottom nav / hide breadcrumbs. */
export function useIsPhone() {
  return React.useSyncExternalStore(
    (onStoreChange) => subscribeMaxWidth(639, onStoreChange),
    () => getMaxWidthSnapshot(639),
    () => false
  );
}
