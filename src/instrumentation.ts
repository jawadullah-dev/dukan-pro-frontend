import * as Sentry from '@sentry/nextjs';

const sentryOptions: Sentry.NodeOptions | Sentry.EdgeOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  spotlight: process.env.NODE_ENV === 'development',

  sendDefaultPii: true,

  tracesSampleRate: 1,

  debug: false
};

export async function register() {
  const sentryDisabled =
    process.env.NEXT_PUBLIC_SENTRY_DISABLED === 'true' || !process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!sentryDisabled) {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      Sentry.init(sentryOptions);
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      Sentry.init(sentryOptions);
    }
  }
}

export const onRequestError = Sentry.captureRequestError;
