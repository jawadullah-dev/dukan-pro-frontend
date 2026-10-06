'use client';

import { useAppearanceStore } from '@/lib/appearance/store';
import { en, type MessageKey } from './messages/en';
import { getLocale, setLocale, t, type AppLocale } from './index';

/** Keep module locale in sync and re-render when language changes. */
export function useT(): typeof t {
  const language = useAppearanceStore((s) => s.language) as AppLocale;
  if (getLocale() !== language) {
    setLocale(language);
  }
  // Depend on language so callers re-render when it changes.
  void language;
  return t;
}

/** Translate if `value` is a known message key; otherwise return as-is (mock/data). */
export function translateMaybe(value: string, translate: typeof t = t): string {
  if (value in en) return translate(value as MessageKey);
  return value;
}
