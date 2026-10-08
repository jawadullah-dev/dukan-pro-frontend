import type { AppearanceState } from './store';

const RADIUS_REM: Record<AppearanceState['radius'], string> = {
  sharp: '0.25rem',
  medium: '0.5rem',
  round: '0.75rem'
};

const ACCENT_OKLCH: Record<AppearanceState['accent'], string> = {
  blue: 'oklch(0.55 0.18 250)',
  green: 'oklch(0.58 0.16 145)',
  purple: 'oklch(0.55 0.2 300)',
  orange: 'oklch(0.68 0.18 55)',
  red: 'oklch(0.58 0.22 25)',
  teal: 'oklch(0.58 0.12 195)'
};

export function applyAppearancePrefs(
  prefs: Pick<AppearanceState, 'density' | 'radius' | 'accent' | 'digits'>
): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.removeProperty('font-size');
  root.style.setProperty('--radius', RADIUS_REM[prefs.radius]);
  root.style.setProperty('--primary', ACCENT_OKLCH[prefs.accent]);
  root.dataset.appearanceDensity = prefs.density;
  root.dataset.appearanceDigits = prefs.digits;
  delete root.dataset.appearanceFont;
}
