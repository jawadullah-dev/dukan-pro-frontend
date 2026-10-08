'use client';

import * as Sentry from '@sentry/nextjs';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';

// global-error replaces the root layout when it errors, so globals.css is not
// loaded here — styles must be inline and self-contained.
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
      <body
        style={{
          margin: 0,
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('errors.genericTitle')}</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.25rem' }}>
            {t('errors.genericDescription')}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '0.5rem',
              border: '1px solid #d1d5db',
              background: 'transparent',
              font: 'inherit',
              cursor: 'pointer'
            }}
          >
            {t('errors.reload')}
          </button>
        </div>
      </body>
    </html>
  );
}
