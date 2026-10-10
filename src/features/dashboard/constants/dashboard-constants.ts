import type { MessageKey } from '@/i18n/messages/en';

export const KPI_LINKS: {
  key:
    | 'today_sales'
    | 'today_net_profit'
    | 'customer_udhar'
    | 'supplier_payable'
    | 'today_expenses'
    | 'low_stock_count'
    | 'cash_position';
  labelKey: MessageKey;
  href: string;
}[] = [
  { key: 'today_sales', labelKey: 'dashboard.todaySales', href: '/dashboard/sales' },
  { key: 'today_net_profit', labelKey: 'dashboard.todayNetProfit', href: '/dashboard/overview' },
  { key: 'customer_udhar', labelKey: 'dashboard.customerUdhar', href: '/dashboard/customers' },
  { key: 'supplier_payable', labelKey: 'dashboard.supplierPayable', href: '/dashboard/suppliers' },
  { key: 'today_expenses', labelKey: 'dashboard.todayExpenses', href: '/dashboard/expenses' },
  { key: 'low_stock_count', labelKey: 'dashboard.lowStock', href: '/dashboard/inventory' },
  { key: 'cash_position', labelKey: 'dashboard.cashPosition', href: '/dashboard/cash' }
];
