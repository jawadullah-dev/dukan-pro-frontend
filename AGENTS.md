# AGENTS.md — Dukaan Pro Frontend Reference

This document is the **single source of truth** for AI coding agents and developers working on `dukan-pro-frontend`. It details the architecture, conventions, folder layout, domain feature anatomy, backend API contracts, and business workflow blueprints for integration with the NestJS backend (`dukan-pro-backend`).

---

## 1. Project Overview & Philosophy

**Dukaan Pro** is a multi-tenant SaaS POS (Point of Sale) and inventory management system purpose-built for Pakistani mobile phone retailers.

- **Primary User Classes**:
  1. **Shop Owner (`OWNER` role)**: Manages one physical shop — catalog, inward purchases (with IMEI tracking), POS sales, Udhar (customer credit), supplier payables, expenses, cash drawer, business reports, and online storefront. Every request is strictly shop-scoped.
  2. **Platform Admin (`SUPER_ADMIN` role)**: Manages the SaaS platform — creates tenant shops, issues onboarding links, extends subscriptions, and reviews platform-wide metrics. Has no `shop_id`.

- **Deployment & Networking**:
  - **Frontend**: Next.js 16 App Router on `http://localhost:3006`
  - **Backend**: NestJS 12 / Prisma 7 / PostgreSQL on `http://localhost:4000` (`NEXT_PUBLIC_API_URL`)

---

## 2. Technology Stack & Architectural Decisions

| Layer | Technology | Decision Rationale & Strict Rules |
|---|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 | Standard modern Next.js architecture with TypeScript strict mode. |
| **Server State** | TanStack React Query v5 | Handles query caching, background refetching, deduplication, and SSR dehydration via `lib/query-client.ts`. Feature modules define query/mutation option factories. |
| **Form State** | TanStack Form v1 + Zod v4 | **Do NOT use React Hook Form.** TanStack Form v1 with `useAppForm` (`@/lib/form`) is strictly used across all forms for dynamic line items (IMEIs, serial numbers). |
| **URL State** | `nuqs` v2 | Used for URL-driven search, filters, pagination, and tabs without full page reloads. |
| **Client UI State** | Zustand v5 | Used strictly for client-only UI state: theme appearance, layout sidebar collapse, and transient notifications. |
| **HTTP Client** | Native `fetch` via `apiRequest<T>` | **Do NOT install or use Axios.** Native `fetch` wrapped in `@/lib/api/client` handles Bearer tokens, unified error unwrapping, and typing. |
| **Styling & UI** | Tailwind CSS v4, `@shadcn/react`, Base UI | Custom OKLCH multi-theme system with high-contrast RTL support. Tabler icons (`@tabler/icons-react`). |
| **Tables** | TanStack Table v8 | Shared reusable data table in `components/data-table/` (`ResponsiveDataTable`). |
| **i18n** | `next-intl` | Tri-lingual support: English (`en`), Urdu (`ur`), and Pashto (`ps`) with automated RTL layout adjustments. |
| **PWA & Offline** | Serwist | Service worker caching and offline fallback page (`/offline`). |
| **Monitoring** | Sentry Next.js SDK | Global error tracking and API exception capture. |

---

## 3. Backend Contracts & Communication Layer

### 3.1 Base Configuration & Envelope Formats

- **API Base URL**: `http://localhost:4000` (configurable via `NEXT_PUBLIC_API_URL`).
- **Tenancy Rule**: **The frontend NEVER includes `shopId` in mutation or query bodies.** Tenancy is derived strictly on the backend from the authenticated JWT Bearer token.

#### Standard Success Envelope (`ApiSuccessResponse<T>`)
Every successful backend response is wrapped in:
```json
{
  "message": "Operation completed successfully",
  "data": { ... }
}
```
The frontend `apiRequest<T>()` helper automatically unwraps this envelope and returns `data as T`.

#### Paginated Response Format (`PaginatedResponse<T>`)
Endpoints with pagination return the following shape inside `data`:
```json
{
  "items": [ ... ],
  "total": 128,
  "page": 1,
  "pageSize": 20
}
```

#### Backend Error Envelope (`ApiErrorBody`)
All HTTP errors (4xx, 5xx) adhere to:
```json
{
  "statusCode": 400,
  "message": "Validation failed: imei must be a valid 15-digit number",
  "error": "Bad Request"
}
```
*Note*: `message` can be either a single string or an array of strings (from `class-validator`). The `ApiError` class in `@/lib/api` normalizes this into a single readable string.

### 3.2 Authentication & Session Flow (NextAuth v5 Beta)

1. **Credentials Auth**:
   - Owner login: calls `POST /auth/login` with `{ phone, password }`.
   - Platform Admin login: calls `POST /auth/platform-admin/login` with `{ phone, password }`.
   - Phone numbers are normalized using `@/lib/auth/phone` (`normalizePhone`).
2. **Session Storage (`accessToken`)**:
   - The backend-issued JWT Bearer token is saved to the NextAuth JWT cookie (`jwt` callback).
   - It is surfaced on `session.accessToken` via the `session` callback (`src/auth.config.ts`).
   - Every authenticated client/server fetch passes this token:
     ```typescript
     import { apiRequest } from '@/lib/api/client';
     
     const data = await apiRequest<ProductList>('/products', {}, session.accessToken);
     ```
3. **Role Routing**:
   - `OWNER` users are routed to `/dashboard/overview`.
   - `SUPER_ADMIN` users are routed to `/dashboard/platform`.
   - Middleware in `src/proxy.ts` prevents cross-role access and redirects unauthenticated requests to `/login`.

---

## 4. Critical Business Rules & Financial Precision

### 4.1 Money Stored in Paisa (1 PKR = 100 Paisa)
- The backend stores and returns all monetary values as integers (BigInt) representing **paisa**.
- **Never use floating-point numbers for currency calculations.**
- Always use the helper functions in `@/lib/money`:
  - On Form Submit: `toPaisa(pkrInput)` $\rightarrow$ sends integer paisa to the backend.
  - On UI Render: `formatPkr(paisa)` (e.g. `250000` paisa $\rightarrow$ `"Rs 2,500"`).
  - Raw Numeric Conversion: `fromPaisa(paisa)` $\rightarrow$ converts to numeric PKR.

### 4.2 Double-Tap Idempotency (`clientRequestId`)
- Financial mutations (**Sales** and **Purchases**) require a `clientRequestId` UUID.
- **Rule**: Generate the UUID when the dialog/form **opens** (`createClientRequestId()`), not when the user clicks "Submit". If a network timeout occurs and the user re-submits, the same `clientRequestId` prevents duplicate transactions.

### 4.3 Two-Step Overdraft Confirmation Flow
- Operations that reduce the cash drawer (e.g., cancelling a sale, cancelling a purchase, owner withdrawal, or cash refunds) may cause an overdraft.
- When an overdraft occurs, the backend does **not** commit immediately. Instead, it responds with:
  ```json
  {
    "confirmOverdraft": true,
    "shortfall": 500000,
    "message": "This operation will cause a cash drawer overdraft of Rs 5,000. Do you want to proceed?"
  }
  ```
- **Frontend Contract**:
  1. Detect `confirmOverdraft: true` in the mutation response.
  2. Open an Overdraft Confirmation dialog displaying the shortfall.
  3. If confirmed by the owner, re-submit the mutation with `{ confirmOverdraft: true }`.

### 4.4 `SERIALIZED` vs `QUANTITY` Tracking
- **`SERIALIZED` (Mobile Phones)**:
  - Each item is uniquely identified by its 15-digit IMEI.
  - **Inward Purchases**: Requires entry of unique IMEI numbers.
  - **POS Sales**: Must select specific units currently `IN_STOCK` (`inventoryUnitId`). Quantity is strictly 1 per unit row.
- **`QUANTITY` (Accessories, Chargers, Cases)**:
  - Tracked in bulk by quantity and weighted average unit cost.

### 4.5 Sale Cancellation Constraints
- If a sale has associated returns/refunds, the backend will reject cancellation with a 400 error.
- Always call `GET /sales/:id/cancel-impact` before prompting for cancellation to preview refundable amounts, cash reversals, and whether the cancellation is blocked.

---

## 5. Directory Architecture & Feature Anatomy

### 5.1 Project Directory Structure

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
│   │   │   ├── returns/           # WF15 Returns & refunds
│   │   │   ├── reports/           # WF18 Reports & CSV exports
│   │   │   ├── store/             # WF19-22 Online store settings
│   │   │   └── platform/          # Platform Admin (SUPER_ADMIN) views
│   │   ├── store/                 # WF19-22 Public storefront (outside dashboard)
│   │   │   └── [slug]/            # Public catalog per shop
│   │   └── login/                 # Multi-role login page
│   └── api/
│       └── auth/[...nextauth]/    # NextAuth API handlers
│
├── components/                    # Shared reusable component library
│   ├── ui/                        # Low-level primitives (Button, Dialog, Table, etc.)
│   ├── forms/                     # Form field components & entity selectors
│   ├── data-table/                # ResponsiveDataTable, column headers, pagination
│   ├── common/                    # Common action buttons, dialog footers
│   └── layout/                    # Sidebar, Header, MobileBottomNav, PageContainer
│
├── features/                      # Isolated domain feature modules
│   ├── products/                  # Product catalog management
│   ├── categories/                # Category taxonomies
│   ├── brands/                    # Brand taxonomies
│   ├── purchases/                 # Inward supplier purchases & IMEI entry
│   ├── sales/                     # Outward POS sales, Udhar & receipts
│   ├── customers/                 # Customer profiles & Udhar ledger
│   ├── suppliers/                 # Supplier profiles & payables
│   ├── inventory/                 # Stock levels, movements, adjustments
│   ├── expenses/                  # Shop operational expenses
│   ├── cash/                      # Drawer cash & ledger movements
│   ├── cash-reconciliations/      # WF17 Cash drawer count reconciliations
│   ├── returns/                   # WF15 Sales returns & refunds
│   ├── reports/                   # WF18 Reports (Sales, Profit, CSV)
│   ├── online-store/              # WF19-22 Public store settings & storefront
│   ├── dashboard/                 # KPI metrics & snapshot calculations
│   └── platform-admin/            # SaaS platform management (shops, subscriptions)
│
├── lib/                           # Core utilities
│   ├── api/                       # apiRequest client, ApiError, envelope types
│   ├── money/                     # toPaisa, fromPaisa, formatPkr
│   ├── dates/                     # todayIsoDate, nowIso, formatDateTime
│   ├── auth/                      # NextAuth helpers, route guards, phone normalizer
│   ├── form.ts                    # useAppForm TanStack Form hook wrapper
│   └── query-client.ts            # Singleton QueryClient with SSR dehydration
│
├── config/                        # Navigation configurations (nav-config, platform-nav-config)
├── hooks/                         # Generic UI hooks (use-data-table, use-nav, etc.)
├── i18n/                          # Translations & locale routing
└── types/                         # Global and ambient type definitions
```

### 5.2 Standard Feature Module Anatomy

Every feature directory in `src/features/<module>/` strictly follows this pattern:

```
src/features/<module>/
├── api/
│   ├── service.ts                 # Typed apiRequest calls to backend endpoints
│   ├── queries.ts                 # TanStack queryOptions factory (keys + queryFn)
│   └── mutations.ts               # TanStack mutationOptions factory (invalidations)
├── components/                    # Feature data tables, dialogs, forms, cell actions
├── schemas/                       # Zod validation schemas for forms and filters
├── constants/                     # Filter dropdown options, column definitions
└── index.ts                       # Public barrel exports
```

---

## 6. Comprehensive Backend API Endpoints Catalog

| Domain | Method & Endpoint | Description & Key Parameters |
|---|---|---|
| **Auth** | `POST /auth/login` | Owner login `{ phone, password }` $\rightarrow$ `{ accessToken, user, shop }` |
| | `POST /auth/platform-admin/login` | Admin login `{ phone, password }` $\rightarrow$ `{ accessToken, admin }` |
| | `POST /auth/setup-password` | One-time link password setup |
| | `GET /auth/me` | Current user profile, role, and shop status |
| | `POST /auth/change-password` | Password change with current verification |
| **Products** | `GET /products` | Query: `?page&pageSize&search&categoryId&brandId&trackingType&isActive` |
| | `POST /products` | Create product (tracking type `SERIALIZED` or `QUANTITY` is immutable) |
| | `GET /products/:id` | Single product details |
| | `PATCH /products/:id` | Update product attributes |
| | `PATCH /products/publish` | Bulk toggle online store publish status |
| **Taxonomies** | `GET/POST/PATCH/DELETE /categories` | Category CRUD |
| | `GET/POST/PATCH/DELETE /brands` | Brand CRUD |
| **Suppliers** | `GET/POST/PATCH /suppliers` | Suppliers register (includes `opening_balance`) |
| | `GET /suppliers/:id/ledger` | Running payable ledger |
| **Customers** | `GET/POST/PATCH /customers` | Customers register (includes `opening_balance`) |
| | `GET /customers/:id` | Customer details & credit/Udhar summary |
| **Purchases** | `POST /purchases` | Multi-line purchase, IMEI entries, `clientRequestId`, `isOpeningStock` |
| | `GET /purchases` | Paginated purchase orders |
| | `GET /purchases/:id/cancel-impact` | Cancellation impact preview (cash & stock reversals) |
| | `POST /purchases/:id/cancel` | Cancel purchase `{ cancelReason, confirmOverdraft? }` |
| **Sales** | `POST /sales` | Multi-line POS sale, `clientRequestId`, customer, discount, paid now |
| | `GET /sales` | Paginated sales list |
| | `GET /sales/:id` | Full sale details for receipts |
| | `GET /sales/:id/cancel-impact` | Cancellation impact preview |
| | `POST /sales/:id/cancel` | Cancel sale `{ cancelReason, confirmOverdraft? }` |
| **Payments** | `POST /payments` | Customer payment against Udhar (oldest-first allocation) |
| | `POST /payments/:id/cancel` | Cancel customer payment |
| | `GET /payments` | Customer payment history |
| **Supplier Payments** | `POST /supplier-payments` | Payment to supplier |
| | `POST /supplier-payments/:id/cancel` | Cancel supplier payment |
| | `GET /supplier-payments` | Supplier payment history |
| **Expenses** | `POST /expenses` | Create operational expense with category and payment method |
| | `PATCH /expenses/:id/cancel` | Cancel expense entry |
| | `GET /expenses` | Paginated expenses list |
| | `GET/POST/PATCH /expense-categories` | Expense category definitions |
| **Inventory** | `GET /inventory` | Stock balances by product |
| | `POST /inventory/adjust` | Adjust stock: `ADJUSTMENT`, `DAMAGED`, `LOST` |
| | `GET /inventory/movements` | Immutable stock movements diary |
| | `GET /inventory/units` | Filter serialized units: `?productId&status=IN_STOCK` |
| **Cash** | `POST /cash/initialize` | Initialize shop cash drawer (`OPENING_CASH`, once per shop) |
| | `POST /cash/invest` | Owner cash investment (`WF16`) |
| | `POST /cash/withdraw` | Owner cash withdrawal (`WF16`, checks overdraft) |
| | `POST /cash/reconcile` | Cash count reconciliation (`WF17`, creates variance movement) |
| | `GET /cash/movements` | Immutable cash drawer diary |
| **Dashboard** | `GET /dashboard` | Business snapshot KPIs `?period=today\|yesterday\|month` |
| **Reports** | `GET /reports/:type` | Types: `sales`, `purchases`, `expenses`, `profit`, `customers`, `suppliers`, `inventory`, `best-sellers` |
| | | Supports date filters `?from&to` and CSV export `?format=csv` |
| **Online Store** | `GET /store/settings` | Public store configuration (slug, WhatsApp, active status) |
| | `PATCH /store/settings` | Update store configuration |
| | `GET/POST/DELETE /products/:id/images` | Product photos management (supports reordering) |
| **Storefront** | `GET /storefront/:slug` | Public store profile (unauthenticated) |
| | `GET /storefront/:slug/products` | Public product catalog: `?page&limit&search&category&inStockOnly` |
| **Platform Admin**| `GET /platform/shops` | List all tenant shops (SUPER_ADMIN only) |
| | `POST /platform/shops` | Create new tenant shop and owner |
| | `POST /platform/shops/:id/issue-setup-link` | Generate password setup link |
| | `PATCH /platform/shops/:id/subscription` | Extend or modify subscription date |
| | `GET /platform/overview` | SaaS platform aggregate KPIs |

---

## 7. Business Workflow Blueprints

### 7.1 POS New Sale Workflow
```
User clicks "New Sale"
  ├── Generate UUID clientRequestId
  ├── Prefetch: active products, customers, IN_STOCK serial units
  ├── User selects items:
  │     ├── SERIALIZED: Select specific IMEI from IN_STOCK units
  │     └── QUANTITY: Specify quantity and unit selling price
  ├── Calculate: subtotal, discount, total, paid_now, remaining (Udhar)
  │     └── If remaining > 0 or has SERIALIZED item: Customer selection is REQUIRED
  ├── Submit: POST /sales with clientRequestId
  └── On Success:
        ├── Invalidate query keys: sales, inventory, cash, dashboard, customers
        └── Open Receipt Dialog / Route to /dashboard/sales/:id
```

### 7.2 Inward Purchase Workflow
```
User clicks "New Purchase"
  ├── Generate UUID clientRequestId
  ├── Select Supplier
  ├── Add line items:
  │     ├── SERIALIZED: Input list of IMEIs (textarea: comma or newline separated)
  │     └── QUANTITY: Input quantity and purchase price per unit
  ├── Checkbox: "Opening Stock" (suppresses cash movement if enabled)
  ├── Submit: POST /purchases
  └── On Success:
        └── Invalidate query keys: purchases, inventory, cash, suppliers, dashboard
```

### 7.3 Cancel Transaction Flow (Sale or Purchase)
```
User clicks "Cancel" on a transaction
  ├── Call GET /:id/cancel-impact
  │     ├── If returns exist (for sale): Show blocked message (cannot cancel)
  │     └── Display preview of cash reversal & inventory reinstatement
  ├── User enters cancelReason and confirms
  ├── Submit POST /:id/cancel { cancelReason }
  ├── Backend checks cash drawer:
  │     ├── If overdraft occurs: Returns { confirmOverdraft: true, shortfall }
  │     │     └── Prompt user: "Cash drawer will have a deficit of Rs X. Confirm?"
  │     │     └── If confirmed: Re-submit POST /:id/cancel { cancelReason, confirmOverdraft: true }
  │     └── If successful: Invalidate queries and update table
```

### 7.4 Cash Drawer Reconciliation (`WF17`)
```
User counts physical drawer notes & coins
  ├── Enters physical cash count into form
  ├── Form calculates variance: physicalCount - systemExpectedBalance
  ├── Submit: POST /cash/reconcile { actualBalance, notes }
  └── Backend writes an immutable CASH_COUNT movement with the variance
```

---

## 8. Discrepancies, Constraints & Anti-Patterns

1. **No `TRIAL` Status**:
   - The backend schema only supports `ACTIVE` and `SUSPENDED` shop statuses. Do not model or display `TRIAL`.
2. **No PDF Exports**:
   - Backend returns `400 pdfExportNotAvailable()` for PDF report requests. **Only CSV export (`?format=csv`) is supported.** Stream the CSV response via browser download.
3. **No Frontend Password Hashing**:
   - Never use `bcryptjs` on the client. Credentials must be sent securely via HTTPS directly to `/auth/login`.
4. **Subscription Expiry Handling**:
   - If `shop.subscriptionEndsAt` is past or shop status is `SUSPENDED`, display a subscription locked banner/modal blocking mutation operations.
5. **Form Field Libraries**:
   - Always use `@/components/forms/fields` and `@/lib/form` (`useAppForm`). Do not introduce third-party form wrappers.
