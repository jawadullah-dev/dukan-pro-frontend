/// <reference lib="esnext" />
/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  RangeRequestsPlugin,
  Serwist,
  StaleWhileRevalidate
} from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'v1';

/** Paths that must never be stored in a Cache API bucket. */
function isBusinessPath(pathname: string): boolean {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/monitoring')
  );
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // Wait for user confirmation before activating (see PwaUpdateBanner).
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Mutations — never cache
    {
      matcher: ({ request }) => request.method !== 'GET' && request.method !== 'HEAD',
      handler: new NetworkOnly()
    },
    // All API + auth — never cache (shared shop devices)
    {
      matcher: ({ url }) => isBusinessPath(url.pathname) && url.pathname.startsWith('/api/'),
      handler: new NetworkOnly({ networkTimeoutSeconds: 10 })
    },
    {
      matcher: /\/api\/auth\/.*/,
      handler: new NetworkOnly({ networkTimeoutSeconds: 10 })
    },
    // Dashboard navigations / RSC — network only (contains business data)
    {
      matcher: ({ request, url, sameOrigin }) =>
        sameOrigin &&
        isBusinessPath(url.pathname) &&
        (request.mode === 'navigate' ||
          request.destination === 'document' ||
          request.headers.get('RSC') === '1'),
      handler: new NetworkOnly()
    },
    // Static fonts / media / next assets
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
      handler: new CacheFirst({
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
      handler: new CacheFirst({
        cacheName: `static-audio-${CACHE_VERSION}`,
        plugins: [
          new ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 }),
          new RangeRequestsPlugin()
        ]
      })
    },
    // Public pages only (login, offline) — network-first
    {
      matcher: ({ request, url, sameOrigin }) =>
        sameOrigin &&
        !isBusinessPath(url.pathname) &&
        (request.mode === 'navigate' || request.destination === 'document'),
      handler: new NetworkFirst({
        cacheName: `pages-public-${CACHE_VERSION}`,
        networkTimeoutSeconds: 5,
        plugins: [new ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 })]
      })
    },
    // Same-origin fallback for other non-API GETs
    {
      matcher: ({ url, sameOrigin }) => sameOrigin && !isBusinessPath(url.pathname),
      handler: new NetworkFirst({
        cacheName: `misc-public-${CACHE_VERSION}`,
        networkTimeoutSeconds: 8,
        plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 })]
      })
    },
    // Cross-origin: network only
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
          return request.destination === 'document';
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

// Future: push notifications can hook here without restructuring the worker.
// self.addEventListener('push', (event) => { ... });

serwist.addEventListeners();
