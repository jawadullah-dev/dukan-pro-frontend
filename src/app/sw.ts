import type { PrecacheEntry, SerwistGlobalConfig, SerwistPlugin } from 'serwist';
import {
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  RangeRequestsPlugin,
  Serwist,
  StaleWhileRevalidate
} from 'serwist';
import { NetworkOnlyWithRetry } from '@/app/sw-network-retry';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'v2';

function isBusinessPath(pathname: string): boolean {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/monitoring')
  );
}

const skipRedirectCachePlugin: SerwistPlugin = {
  cacheWillUpdate: async ({ response }) => {
    if (!response) return null;
    if (response.redirected || response.type === 'opaqueredirect') return null;
    if (response.status !== 200) return null;
    return response;
  }
};

const businessNetwork = new NetworkOnlyWithRetry({
  maxAttempts: 3,
  retryDelayMs: 280
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,

  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request }) => request.method !== 'GET' && request.method !== 'HEAD',
      handler: new NetworkOnly()
    },

    {
      matcher: ({ url, sameOrigin }) =>
        sameOrigin && (url.pathname.startsWith('/api/') || url.pathname.startsWith('/monitoring')),
      handler: businessNetwork
    },

    {
      matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/dashboard'),
      handler: businessNetwork
    },

    {
      matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: `static-font-${CACHE_VERSION}`,
        plugins: [new ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 7 })]
      })
    },
    {
      matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: `static-image-${CACHE_VERSION}`,
        plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 })]
      })
    },

    {
      matcher: /\/_next\/static.+\.js$/i,
      handler: new StaleWhileRevalidate({
        cacheName: `next-static-js-${CACHE_VERSION}`,
        plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 })]
      })
    },
    {
      matcher: /\/_next\/image\?url=.+$/i,
      handler: new StaleWhileRevalidate({
        cacheName: `next-image-${CACHE_VERSION}`,
        plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 })]
      })
    },
    {
      matcher: /\.(?:js)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: `static-js-${CACHE_VERSION}`,
        plugins: [new ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 60 * 60 * 24 })]
      })
    },
    {
      matcher: /\.(?:css|less)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: `static-css-${CACHE_VERSION}`,
        plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 })]
      })
    },
    {
      matcher: /\.(?:mp3|wav|ogg)$/i,
      handler: new NetworkFirst({
        cacheName: `static-audio-${CACHE_VERSION}`,
        plugins: [
          new ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 }),
          new RangeRequestsPlugin()
        ]
      })
    },

    {
      matcher: ({ request, url, sameOrigin }) =>
        sameOrigin &&
        url.pathname === '/' &&
        (request.mode === 'navigate' || request.destination === 'document'),
      handler: businessNetwork
    },

    {
      matcher: ({ request, url, sameOrigin }) =>
        sameOrigin &&
        !isBusinessPath(url.pathname) &&
        url.pathname !== '/' &&
        (request.mode === 'navigate' || request.destination === 'document'),
      handler: new NetworkFirst({
        cacheName: `pages-public-${CACHE_VERSION}`,
        networkTimeoutSeconds: 8,
        plugins: [
          skipRedirectCachePlugin,
          new ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 })
        ]
      })
    },

    {
      matcher: ({ url, sameOrigin }) =>
        sameOrigin && !isBusinessPath(url.pathname) && url.pathname !== '/',
      handler: new NetworkFirst({
        cacheName: `misc-public-${CACHE_VERSION}`,
        networkTimeoutSeconds: 8,
        plugins: [
          skipRedirectCachePlugin,
          new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 })
        ]
      })
    },

    {
      matcher: ({ sameOrigin }) => !sameOrigin,
      handler: new NetworkOnly()
    }
  ],
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return (
            request.mode === 'navigate' ||
            request.destination === 'document' ||
            request.destination === ''
          );
        }
      }
    ]
  }
});

self.addEventListener('message', (event) => {
  const data = event.data as { type?: string } | undefined;
  if (data?.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
  if (data?.type === 'CLEAR_RUNTIME_CACHES') {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter(
              (key) =>
                key.includes('v1') ||
                key.includes(CACHE_VERSION) ||
                key.startsWith('pages-') ||
                key.startsWith('static-') ||
                key.startsWith('misc-') ||
                key.startsWith('next-')
            )
            .map((key) => caches.delete(key))
        );
      })()
    );
  }
});

serwist.addEventListeners();
