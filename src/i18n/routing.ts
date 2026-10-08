import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales } from './request';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365 * 5
  },
  alternateLinks: true
});
