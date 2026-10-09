'use client';

import * as Sentry from '@sentry/nextjs';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const t = useTranslations();
  const locale = useLocale();
  const dir = locale === 'ur' || locale === 'ps' ? 'rtl' : 'ltr';

  useEffect(() => {
    Sentry.captureException(error);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [dir, error, locale]);

  return (
    <html lang={locale} dir={dir}>
      <body className='m-0 flex min-h-screen items-center justify-center font-sans'>
        <div className='p-4 text-center'>
          <h1 className='mb-2 text-2xl font-bold'>{t('errors.genericTitle')}</h1>
          <p className='mb-5 text-muted-foreground'>{t('errors.genericDescription')}</p>
          <button
            onClick={() => reset()}
            className='cursor-pointer rounded-lg border border-border bg-transparent px-5 py-2 font-inherit'
          >
            {t('errors.reload')}
          </button>
        </div>
      </body>
    </html>
  );
}
