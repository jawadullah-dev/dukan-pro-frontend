import { Icons } from '@/components/icons';

export interface PermissionCheck {
  permission?: string;
  plan?: string;
  feature?: string;
  role?: string;
  requireOrg?: boolean;
}

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
  access?: PermissionCheck;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export * from './supplier-payment';
export * from './expense';
export * from './cash';
export * from './purchases';
export * from './payment';
export * from './inventory';
export * from './sales';
export * from './products';
export * from './suppliers';
export * from './auth';
export * from './brands';
export * from './categories';
export * from './customers';
export * from './dukaan';
export * from './overview';
export * from './platform-admin';
export * from './data-table';
export * from './forms';
export * from './layout';
export * from './common';
export * from './pages';
export * from './party';
