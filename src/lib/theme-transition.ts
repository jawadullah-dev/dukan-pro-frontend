import type { ThemeTransitionOrigin } from '@/types/common';

export type { ThemeTransitionOrigin };

export function startThemeTransition(apply: () => void, origin?: ThemeTransitionOrigin) {
  const root = document.documentElement;

  if (!document.startViewTransition) {
    apply();
    return;
  }

  if (origin) {
    root.style.setProperty('--x', `${origin.clientX}px`);
    root.style.setProperty('--y', `${origin.clientY}px`);
  }

  document.startViewTransition(apply);
}
