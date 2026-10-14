import type { ComponentType } from 'react';
import type { MessageKey } from '@/i18n/messages/en';

export type DashboardKpiKey =
  | 'today_sales'
  | 'today_net_profit'
  | 'customer_udhar'
  | 'supplier_payable'
  | 'today_expenses'
  | 'low_stock_count'
  | 'cash_position';

export interface DashboardKpiLink {
  key: DashboardKpiKey;
  labelKey: MessageKey;
  href: string;
}

export interface RowAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
}

export interface RowActionsMenuProps {
  actions: RowAction[];
}
