import type { AppearanceState } from './store';

export const RADIUS_REM: Record<AppearanceState['radius'], string> = {
  sharp: '0.25rem',
  medium: '0.5rem',
  round: '0.75rem'
};

export const ACCENT_OKLCH: Record<AppearanceState['accent'], string> = {
  blue: 'oklch(0.55 0.18 250)',
  green: 'oklch(0.58 0.16 145)',
  purple: 'oklch(0.55 0.2 300)',
  orange: 'oklch(0.68 0.18 55)',
  red: 'oklch(0.58 0.22 25)',
  teal: 'oklch(0.58 0.12 195)'
};

function setAppearanceCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax; ${isHttps ? 'Secure;' : ''}`;
}

export function applyAppearancePrefs(
  prefs: Pick<AppearanceState, 'density' | 'radius' | 'accent' | 'digits'>
): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.removeProperty('font-size');
  if (prefs.radius && RADIUS_REM[prefs.radius]) {
    root.style.setProperty('--radius', RADIUS_REM[prefs.radius]);
    setAppearanceCookie('dukaan_radius', prefs.radius);
  }
  if (prefs.accent && ACCENT_OKLCH[prefs.accent]) {
    root.style.setProperty('--primary', ACCENT_OKLCH[prefs.accent]);
    setAppearanceCookie('dukaan_accent', prefs.accent);
  }
  if (prefs.density) {
    root.dataset.appearanceDensity = prefs.density;
    setAppearanceCookie('dukaan_density', prefs.density);
  }
  if (prefs.digits) {
    root.dataset.appearanceDigits = prefs.digits;
    setAppearanceCookie('dukaan_digits', prefs.digits);
  }
  delete root.dataset.appearanceFont;
}
