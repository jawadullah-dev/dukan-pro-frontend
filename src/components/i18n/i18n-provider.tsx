'use client';

import { NextIntlClientProvider } from 'next-intl';
import { t as staticT, setLocale } from '@/i18n';
import type { I18nProviderProps } from '@/types';
export type { I18nProviderProps };

export function I18nProvider({ children, ...props }: I18nProviderProps) {
  if (props.locale) {
    setLocale(props.locale as string);
  }

  return (
    <NextIntlClientProvider
      {...props}
      onError={(error) => {
        if (error.code === 'MISSING_MESSAGE') return;
      }}
      getMessageFallback={({ key }) => {
        const resolved = staticT(key);
        if (resolved && resolved !== key) {
          return resolved;
        }

        if (key.startsWith('common.')) {
          const seg = key.slice(7);
          return seg.charAt(0).toUpperCase() + seg.slice(1);
        }

        if (key.startsWith('search.')) {
          const seg = key.slice(7);
          return `Search ${seg}...`;
        }

        return key;
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
