import * as React from 'react';

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

export function useIsPhone() {
  return React.useSyncExternalStore(
    (onStoreChange) => subscribeMaxWidth(639, onStoreChange),
    () => getMaxWidthSnapshot(639),
    () => false
  );
}
