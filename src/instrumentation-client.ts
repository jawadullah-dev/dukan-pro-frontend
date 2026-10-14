import * as Sentry from '@sentry/nextjs';

if (process.env.NEXT_PUBLIC_SENTRY_DISABLED !== 'true' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    sendDefaultPii: true,
    tracesSampleRate: 1,
    debug: false
  });
}

import type { SentryClientModule } from '@/types/common';

export const onRouterTransitionStart = (Sentry as SentryClientModule).captureRouterTransitionStart;
