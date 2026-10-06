import type { MessageKey } from '@/i18n/messages/en';

/** Map dashboard path segments / paths to page title keys. */
const PATH_TITLE_KEYS: Record<string, MessageKey> = {
  overview: 'pages.dashboard.title',
  products: 'pages.products.title',
  categories: 'pages.categories.title',
  brands: 'pages.brands.title',
  purchases: 'pages.purchases.title',
  inventory: 'pages.inventory.title',
  'stock-adjustments': 'pages.adjustments.title',
  'inventory-movements': 'pages.movements.title',
  sales: 'pages.sales.title',
  customers: 'pages.customers.title',
  payments: 'pages.payments.title',
  'supplier-payments': 'pages.supplierPayments.title',
  expenses: 'pages.expenses.title',
  'expense-categories': 'pages.expenseCategories.title',
  cash: 'pages.cash.title',
  suppliers: 'pages.suppliers.title',
  appearance: 'pages.appearance.title',
  platform: 'pages.platform.title',
  shops: 'pages.shops.title',
  subscriptions: 'pages.subscriptions.title'
};

export function pageTitleKeyFromPath(pathname: string): MessageKey | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'dashboard') return null;
  // Prefer last meaningful segment (skip ids).
  for (let i = parts.length - 1; i >= 1; i--) {
    const seg = parts[i];
    if (/^\d+$/.test(seg) || seg === 'new' || seg === 'receipt') continue;
    if (seg in PATH_TITLE_KEYS) return PATH_TITLE_KEYS[seg];
  }
  return 'pages.dashboard.title';
}
