import type { NextConfig } from 'next';
import { createRequire } from 'node:module';

const baseConfig: NextConfig = {
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
};

const sentryEnabled =
  Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) &&
  process.env.NEXT_PUBLIC_SENTRY_DISABLED !== 'true';

function withOptionalSentry(config: NextConfig): NextConfig {
  if (!sentryEnabled) return config;

  // Load from the package root (not `@sentry/nextjs/config`) so builds work
  // across Sentry versions on Vercel / Bun.
  const require = createRequire(import.meta.url);
  const { withSentryConfig } = require('@sentry/nextjs') as typeof import('@sentry/nextjs');

  return withSentryConfig(config, {
    org: process.env.NEXT_PUBLIC_SENTRY_ORG,
    project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
    telemetry: false,
    webpack: {
      reactComponentAnnotation: {
        enabled: true
      },
      treeshake: {
        removeDebugLogging: true
      }
    },
    sourcemaps: {
      disable: !process.env.NEXT_PUBLIC_SENTRY_ORG || !process.env.NEXT_PUBLIC_SENTRY_PROJECT
    }
  });
}

const nextConfig = withOptionalSentry(baseConfig);
export default nextConfig;
