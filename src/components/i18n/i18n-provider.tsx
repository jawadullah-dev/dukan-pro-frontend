'use client';

import { NextIntlClientProvider } from 'next-intl';
import * as React from 'react';
import { t as staticT, setLocale } from '@/i18n';

type Props = React.ComponentProps<typeof NextIntlClientProvider>;

export function I18nProvider({ children, ...props }: Props) {
  if (props.locale) {
    setLocale(props.locale as string);
  }

  return (
    <NextIntlClientProvider
      {...props}
      onError={(error) => {
        // Suppress MISSING_MESSAGE console spam so the app never throws red IntlErrors
        if (error.code === 'MISSING_MESSAGE') return;
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[next-intl]', error.message);
        }
      }}
      getMessageFallback={({ key }) => {
        // First try static lookup across catalogs for the active locale
        const resolved = staticT(key);
        if (resolved && resolved !== key) {
          return resolved;
        }

        // Clean fallback so users never see raw dot prefixes like "common.delete"
        if (key.startsWith('common.')) {
          const seg = key.slice(7);
          return seg.charAt(0).toUpperCase() + seg.slice(1);
        }

        return key;
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
