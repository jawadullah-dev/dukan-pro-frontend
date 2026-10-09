import { isLocale, locales } from '@/i18n/request';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getNow, getTimeZone, setRequestLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import Providers from '@/components/layout/providers';
import { PwaShell } from '@/components/pwa/pwa-shell';
import { Toaster } from '@/components/ui/sonner';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import { LocaleDocumentAttributes } from '@/components/locale-document-attributes';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const [messages, now, timeZone, cookieStore] = await Promise.all([
    getMessages(),
    getNow(),
    getTimeZone(),
    cookies()
  ]);
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const themeToApply =
    THEMES.some((theme) => theme.value === activeThemeValue) && activeThemeValue
      ? activeThemeValue
      : DEFAULT_THEME;

  return (
    <NextIntlClientProvider locale={locale} messages={messages} now={now} timeZone={timeZone}>
      <LocaleDocumentAttributes />
      <Providers activeThemeValue={themeToApply}>
        <PwaShell>
          <Toaster />
          {children}
        </PwaShell>
      </Providers>
    </NextIntlClientProvider>
  );
}
