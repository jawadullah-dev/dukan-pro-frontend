'use client';

import { useTranslations } from 'next-intl';

/**
 * Shorthand for `useTranslations()` on the root namespace.
 * Mirrors the call signature so `t('pages.dashboard.title')` works.
 */
export function useT() {
  return useTranslations();
}

/**
 * Accept either a dot-notation message key (e.g. `pages.sales.title`)
 * or a plain pre-translated string. If the value looks like a key
 * (contains a dot) and the translation resolves, the translated value
 * is returned; otherwise the original string is passed through unchanged.
 *
 * This lets page containers accept both i18n keys (for regular pages)
 * and literal titles (for one-off demo / feature pages) without a
 * hard requirement on the message registry.
 */
export function translateMaybe(keyOrText: string, t: ReturnType<typeof useTranslations>): string {
  if (!keyOrText) return '';
  if (!keyOrText.includes('.')) return keyOrText;
  try {
    const translated = t(keyOrText as never);
    return translated == null ? keyOrText : String(translated);
  } catch {
    return keyOrText;
  }
}
