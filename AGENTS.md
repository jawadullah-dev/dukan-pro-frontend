# AGENTS.md — Dukaan Pro Frontend Reference

This file is the single source of truth for AI coding agents working on `dukan-pro-frontend`. It details the architecture, conventions, folder layout, domain features, and the API integration roadmap with the NestJS backend (`dukan-pro-backend`).

---

## 1. Project Overview

**Dukaan Pro Frontend** is the web dashboard and POS interface for Pakistani mobile phone shop retailers, built with:

- **Framework**: Next.js 16 (App Router)
- **Runtime & UI**: React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4, shadcn/ui primitives, OKLCH multi-theme system
- **State Management**:
  - **Server State**: TanStack React Query v5 (with SSR prefetching and queryOption factories)
  - **URL State**: `nuqs` v2 (for shallow table filtering and pagination)
  - **Form State**: TanStack Form v1 + Zod v4 schemas
  - **Client UI State**: Zustand v5 (for appearance, layout toggle)
- **Internationalization (i18n)**: `next-intl` supporting English (`en`), Urdu (`ur`), and Pashto (`ps`) with RTL support.
- **PWA & Offline**: Serwist service worker, offline fallback route.
- **Backend API**: NestJS 12 running at `http://localhost:4000` (`NEXT_PUBLIC_API_URL`).

---

## 2. Directory Architecture

```
src/
├── app/                           # Next.js App Router directory
│   ├── [locale]/                  # Locale-scoped routes (en, ur, ps)
│   │   ├── dashboard/             # Authenticated dashboard views
│   │   │   ├── overview/          # Business snapshot & KPI cards
│   │   │   ├── products/          # Catalog: Products (Serialized & Quantity)
│   │   │   ├── categories/        # Catalog: Categories
│   │   │   ├── brands/            # Catalog: Brands
│   │   │   ├── purchases/         # Buying from suppliers with IMEI entry
│   │   │   ├── sales/             # POS sales (Cash, Udhar, IMEI selection)
│   │   │   ├── customers/         # Customers register & Udhar ledger
│   │   │   ├── suppliers/         # Suppliers register & payable ledger
│   │   │   ├── inventory/         # Stock counts & thresholds
│   │   │   ├── stock-adjustments/ # Inventory write-offs / corrections
│   │   │   ├── inventory-movements/ # Immutable stock diary
│   │   │   ├── expenses/          # Operational expenses
│   │   │   ├── expense-categories/# Expense category definitions
│   │   │   ├── cash/              # Cash drawer & immutable cash diary
│   │   │   ├── payments/          # Customer payments history
│   │   │   ├── supplier-payments/ # Supplier payments history
│   │   │   └── platform/          # Platform Admin (SUPER_ADMIN) multi-tenant views
│   │   └── login/                 # Owner & Platform Admin login
│   └── api/
│       └── auth/[...nextauth]/    # NextAuth authentication handlers
│
├── components/                    # Shared reusable component library
│   ├── ui/                        # Low-level primitives (Button, Dialog, Table, etc.)
│   ├── forms/                     # Form field components & entity selectors
│   ├── data-table/                # ResponsiveDataTable, column headers, pagination
│   ├── common/                    # Common action buttons, dialog footers
│   └── layout/                    # Sidebar, Header, MobileBottomNav, PageContainer
│
├── features/                      # Isolated domain feature modules
│   ├── products/                  # Product management
│   ├── categories/                # Category management
│   ├── brands/                    # Brand management
│   ├── purchases/                 # Inward purchases & IMEIs
│   ├── sales/                     # Outward sales & receipts
│   ├── customers/                 # Customer profiles & Udhar ledger
│   ├── suppliers/                 # Supplier profiles & payables
│   ├── inventory/                 # Stock levels, movements, adjustments
│   ├── expenses/                  # Shop expense tracking
│   ├── cash/                      # Drawer cash & ledger movements
│   ├── dashboard/                 # KPI metrics & snapshot calculations
│   ├── platform-admin/            # SaaS platform management (shops, subscriptions)
│   ├── returns/                   # WF15 Returns & refunds
│   ├── cash-reconciliations/      # WF17 Cash drawer count reconciliations
│   ├── reports/                   # WF18 Business reports (Sales, Profit, Stock, CSV)
│   └── online-store/              # WF19-22 Public store settings & storefront
│
├── lib/                           # Core utilities
│   ├── api/                       # apiRequest client, ApiError, API envelope types
│   ├── money/                     # toPaisa, fromPaisa, formatPkr, number formatters
│   ├── dates/                     # todayIsoDate, nowIso, formatDateTime
│   ├── auth/                      # NextAuth helpers, route guards, role routing
│   ├── form.ts                    # useAppForm TanStack Form hook wrapper
│   └── query-client.ts            # Singleton QueryClient with SSR dehydration
│
├── config/                        # Navigation configuration (nav-config, platform-nav-config)
├── hooks/                         # Custom React hooks (use-data-table, use-nav, etc.)
├── i18n/                          # Translations & locale routing
└── styles/                        # Tailwind CSS v4 styling & theme configurations
```

---

## 3. Standard Feature Anatomy

Every feature folder in `src/features/<module>/` strictly follows this 4-part structure:

```
src/features/<module>/
├── api/
│   ├── service.ts                 # Direct endpoint / data access calls
│   ├── queries.ts                 # TanStack queryOptions factory (keys + queryFn)
│   └── mutations.ts               # TanStack mutationOptions factory (invalidations)
├── components/                    # Feature tables, dialogs, forms, cell actions
├── schemas/                       # Zod validation schemas
├── constants/                     # Filter options, status options, column configs
└── index.ts                       # Public barrel exports
```

---

## 4. Business Rules & Conventions (Must Follow)

1. **Money Stored in Paisa (1 PKR = 100 Paisa)**:
   - All backend amounts are integers in paisa.
   - Use `@/lib/money`: `toPaisa(pkr)` on submission, `fromPaisa(paisa)` or `formatPkr(paisa)` on display.
2. **Double-Tap Idempotency**:
   - Critical operations (Sales, Purchases) must include `clientRequestId` (UUID) created when opening the dialog.
3. **Tenant Scoping**:
   - The frontend never submits `shopId` in mutation bodies. The backend derives tenancy from the JWT Bearer token.
4. **SERIALIZED vs QUANTITY**:
   - `SERIALIZED` products (mobile phones) track individual units by IMEI (quantity is always 1 per row).
   - `QUANTITY` products (chargers, covers) track quantities and average costs.
5. **Overdraft Confirmations**:
   - Soft cash warnings or refunds taking cash below zero return a two-step confirmation pattern (`confirmOverdraft: true`).

---

## 5. Current Migration Status & Roadmap

### ✅ Completed:
- Extracted core utilities: `@/lib/money`, `@/lib/dates`, `@/lib/api/client.ts`.
- Modularized all 16 business domains into clean, dedicated `features/*` modules.
- Re-wired dashboard pages to import directly from individual feature modules.
- Verified TypeScript compilation: `npm run typecheck` passes with **0 errors**.
- Verified unit test suite: `npm run test` passes with **0 errors**.

### 🔜 Next Steps:
1. **Cleanup**: Remove legacy starter template artifacts (`kanban`, `ai-chat`, `chat`, `react-query-demo`, `features/platform/`).
2. **Real API Integration**:
   - Replace NextAuth mock credentials in `src/auth.ts` with `POST /auth/login`.
   - Store and forward the backend JWT Bearer token on all `apiRequest` calls.
   - Replace feature service calls in `src/features/*/api/service.ts` with live backend API calls.
   - Delete mock store files (`src/lib/dukaan/store.ts` and `src/lib/dukaan/operations.ts`).
3. **Add New Workflow UI Screens**:
   - Returns & Refunds (`/dashboard/returns`).
   - Reports & CSV Export (`/dashboard/reports`).
   - Storefront & Settings (`/dashboard/store` and `/store/[slug]`).
