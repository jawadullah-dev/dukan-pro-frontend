import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from shared config
export const locales = ['en', 'ur', 'ps'] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = 'en';
export const rtlLocales: AppLocale[] = ['ur', 'ps'];

export function isLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}

export function isRtlLocale(locale: AppLocale): boolean {
  return rtlLocales.includes(locale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale from the segment (may be undefined for non-locale routes)
  const requested = await requestLocale;
  const locale: AppLocale = isLocale(requested ?? '') ? (requested as AppLocale) : defaultLocale;
  if (!isLocale(locale)) notFound();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Provide timezone / now globally so all features that need formatting
    // share the same instant of time on the server.
    now: new Date(),
    formats: {
      number: {
        pkCurrency: {
          style: 'currency',
          currency: 'PKR',
          maximumFractionDigits: 2
        },
        afCurrency: {
          style: 'currency',
          currency: 'AFN',
          maximumFractionDigits: 0
        }
      },
      dateTime: {
        short: {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }
      }
    }
  };
});
