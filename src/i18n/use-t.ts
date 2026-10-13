'use client';

import { useTranslations } from 'next-intl';
import { t as staticT } from './index';

export function useT() {
  return useTranslations();
}

export function translateMaybe(keyOrText: string, t?: ReturnType<typeof useTranslations>): string {
  if (!keyOrText) return '';

  if (t) {
    try {
      if (typeof t.has === 'function' && t.has(keyOrText as never)) {
        const translated = t(keyOrText as never);
        if (translated != null && translated !== keyOrText) return String(translated);
      }
      if (!keyOrText.includes('.')) {
        const commonKey = `common.${keyOrText}`;
        if (typeof t.has === 'function' && t.has(commonKey as never)) {
          const translated = t(commonKey as never);
          if (translated != null && translated !== commonKey) return String(translated);
        }
      }
    } catch {}
  }

  const fallback = staticT(keyOrText);
  if (fallback && fallback !== keyOrText) {
    return fallback;
  }

  if (keyOrText.startsWith('common.')) {
    const seg = keyOrText.slice(7);
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  }

  return keyOrText;
}
