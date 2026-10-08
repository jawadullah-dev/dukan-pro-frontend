'use client';

import { useLayoutEffect } from 'react';
import { useLocale } from 'next-intl';
import { isLocale, isRtlLocale } from '@/i18n/request';

export function LocaleDocumentAttributes() {
  const requestedLocale = useLocale();
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en';

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtlLocale(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  return null;
}
