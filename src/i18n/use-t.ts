'use client';

import { useTranslations } from 'next-intl';

export function useT() {
  return useTranslations();
}

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
