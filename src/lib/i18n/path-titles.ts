import { getTranslations } from 'next-intl/server';
import { delocalize } from '@/lib/auth/routes';

/** Map dashboard path segments / paths to page title keys. */
const PATH_TITLE_KEYS: Record<string, string> = {
  overview: 'pages.dashboard.title',
  products: 'pages.products.title',
  product: 'pages.product.title',
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
  subscriptions: 'pages.subscriptions.title',
  forms: 'pages.forms.title',
  users: 'pages.users.title',
  'react-query': 'pages.reactQuery.title',
  icons: 'pages.icons.title',
  kanban: 'pages.kanban.title',
  notifications: 'pages.notifications.title'
};

export function pageTitleKeyFromPath(pathname: string): string | null {
  const clean = delocalize(pathname);
  const parts = clean.split('/').filter(Boolean);
  if (parts[0] !== 'dashboard') return null;
  for (let i = parts.length - 1; i >= 1; i--) {
    const seg = parts[i];
    if (/^\d+$/.test(seg) || seg === 'new' || seg === 'receipt') continue;
    if (seg in PATH_TITLE_KEYS) return PATH_TITLE_KEYS[seg];
  }
  return 'pages.dashboard.title';
}

export async function getTranslatedPageTitle(pathname: string): Promise<string | null> {
  const key = pageTitleKeyFromPath(pathname);
  if (!key) return null;
  const t = await getTranslations();
  return t(key);
}
