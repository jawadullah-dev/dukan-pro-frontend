# Dukaan Pro

Shop management dashboard for mobile/retail dukaan (purchases, sales, inventory, cash, customers, suppliers).

## Stack

- Next.js 16 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- TanStack React Query + Form + Table
- Serwist Progressive Web App (installable on phone and desktop)

## Getting started

```bash
npm install
cp env.example.txt .env.local
npm run generate:icons
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts & Quality Tooling

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server (service worker **disabled**) |
| `npm run build` | Production build (generates Serwist worker) |
| `npm run start` | Start production server |
| `npm run check` | Run all custom checks + dead code (knip) + clone detection (jscpd) |
| `npm run knip` | Scan for unused files, exports, and dependencies |
| `npm run duplicates` | Scan for copy-pasted code via jscpd |
| `npm run lint` | Oxlint fast linting |
| `npm run format` | Code formatting with oxfmt |
| `npm run typecheck` | TypeScript strict check |
| `npm test` | Unit tests |

## Tooling & Architecture Rules

Custom checks under `scripts/` guard project architectural invariants that standard linters miss:
- **`check-types`**: Bans `any`, non-null assertions (`!`), `@ts-ignore`, and untyped objects.
- **`check-nest-type`**: Bans inline/nested object type literals in function parameters and component props.
- **`check-arch-rules`**: Guards `process.env` access, bans inline `style`, enforces RTL logical classes (`ms-`, `me-`, `ps-`, `pe-`), and bans hardcoded hex colors.
- **`check-hardcoded-text`**: Ensures all UI strings are localized via `next-intl`.
- **`check-metadata`**: Verifies every Next.js `page.tsx` is a server component with SEO metadata.
- **`check-structure`**: Enforces feature-sliced architecture and allowed `src/` top-level directories.
- **`check-comments`**: Enforces zero-comments rule for self-documenting code.
- **`check-api-urls`**: Bans hardcoded endpoints outside `src/config/`.
- **`knip`**: Dead code, unused exports, and unneeded dependencies detection.
- **`jscpd`**: Copy-paste / code clone detection.


## Progressive Web App (PWA)

### How it works

- **Manifest** — `src/app/manifest.ts` reads the product name from `src/config/site.ts` (`APP_NAME`, `APP_SHORT_NAME`, `APP_DESCRIPTION`). Rename the app there only.
- **Service worker** — Serwist (`@serwist/turbopack`) builds `/serwist/sw.js` at production build time. It precaches the app shell, icons and the offline page. It **never** caches `/api/*` or `/dashboard/*` HTML/RSC (shared shop devices must not leak stock or money data). Mutations are network-only.
- **Install UI** — `InstallPrompt` captures `beforeinstallprompt` on Chromium, and shows Safari Add-to-Home-Screen instructions on iOS. Banner appears after a couple of visits (not the first load); dismiss hides it for 14 days.
- **Updates** — a waiting worker shows a toast: “A new version is available. Reload”. Reload is user-triggered only (never mid-sale).
- **Logout** — clears Cache Storage and asks the worker to drop runtime caches.
- **Offline** — branded `/~offline` page + slim banner. No offline selling or queued saves in this version.

**Production must be served over HTTPS** (localhost is allowed for development).

### Test locally (production mode)

```bash
npm run generate:icons
npm run build
npm run start
```

Open Chrome → DevTools → **Application**:

1. Manifest valid, icons present, `start_url` `/？source=pwa`
2. Service worker active at `/serwist/sw.js`
3. Lighthouse → Installable

### Install on devices

| Platform | Steps |
| --- | --- |
| **Android Chrome** | Menu → Install app, or use the in-app Install banner |
| **iPhone / iPad** | Safari → Share → **Add to Home Screen** (in-app sheet explains this) |
| **Windows Chrome / Edge** | Address-bar install icon or Install app in the profile menu |
| **macOS Chrome / Edge** | Same as Windows; opens in its own window |

### Replace icons / rename the app

1. Replace `public/icons/source.svg` (or set `SOURCE_ICON=./path/to/logo.png`)
2. Run `npm run generate:icons`
3. To rename: edit `src/config/site.ts` only (`APP_NAME`, `APP_SHORT_NAME`, `APP_DESCRIPTION`)
4. Replace `public/screenshots/wide.png` and `narrow.png` when you have real UI shots

### Clear the service worker while developing

Dev mode does **not** register the worker. If a production build left a worker on localhost:

1. DevTools → Application → Service Workers → **Unregister**
2. Application → Storage → **Clear site data**
3. Hard refresh

### Printing from the installed app

Receipts and invoices use the normal browser print dialog (`window.print`). That works in the installed PWA. Silent printing straight to a thermal printer (no dialog) needs a later desktop wrapper (Tauri / Electron).

### Not built yet (kept possible)

- Push notifications (SW structure leaves room for a `push` handler)
- Offline selling with sync
- Store packaging (PWABuilder / Play / Microsoft Store)

## Push to your own GitHub repo

This project no longer points at the template remote. After you create a new empty repo:

```bash
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```
