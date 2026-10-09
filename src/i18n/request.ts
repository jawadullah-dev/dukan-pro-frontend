import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

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
  const requested = await requestLocale;
  const locale: AppLocale = isLocale(requested ?? '') ? (requested as AppLocale) : defaultLocale;
  if (!isLocale(locale)) notFound();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,

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
