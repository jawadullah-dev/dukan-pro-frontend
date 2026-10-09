export interface ThemeTransitionOrigin {
  clientX: number;
  clientY: number;
}

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
