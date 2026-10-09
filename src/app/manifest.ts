import type { MetadataRoute } from 'next';
import {
  APP_DESCRIPTION,
  APP_ID,
  APP_NAME,
  APP_SHORT_NAME,
  PWA_BACKGROUND_COLOR,
  PWA_THEME_COLOR_LIGHT
} from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    id: APP_ID,
    lang: 'en',
    dir: 'auto',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'any',
    theme_color: PWA_THEME_COLOR_LIGHT,
    background_color: PWA_BACKGROUND_COLOR,
    categories: ['business', 'productivity'],

    prefer_related_applications: false,
    related_applications: [
      {
        platform: 'webapp',
        url: '/manifest.webmanifest',
        id: APP_ID
      }
    ],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    screenshots: [
      {
        src: '/screenshots/wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: `${APP_NAME} desktop`
      },
      {
        src: '/screenshots/narrow.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: `${APP_NAME} mobile`
      }
    ],

    shortcuts: [
      {
        name: 'New sale',
        short_name: 'Sale',
        description: 'Start a new sale',
        url: '/?source=pwa&to=sales',
        icons: [{ src: '/icons/shortcut-sale.png', sizes: '96x96', type: 'image/png' }]
      },
      {
        name: 'Add customer',
        short_name: 'Customer',
        description: 'Add a customer',
        url: '/?source=pwa&to=customers',
        icons: [{ src: '/icons/shortcut-customer.png', sizes: '96x96', type: 'image/png' }]
      },
      {
        name: 'Inventory',
        short_name: 'Stock',
        description: 'Open inventory',
        url: '/?source=pwa&to=inventory',
        icons: [{ src: '/icons/shortcut-inventory.png', sizes: '96x96', type: 'image/png' }]
      }
    ]
  };
}
