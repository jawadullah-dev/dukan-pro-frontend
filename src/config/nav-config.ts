import { NavGroup } from '@/types';
import type { SessionRole } from '@/lib/dukaan/session';
import { platformNavGroups } from '@/config/platform-nav-config';

const shopNavGroups: NavGroup[] = [
  {
    label: 'nav.group.overview',
    items: [
      {
        title: 'nav.dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  },
  {
    label: 'nav.group.catalog',
    items: [
      {
        title: 'nav.products',
        url: '/dashboard/products',
        icon: 'product',
        shortcut: ['p', 'p'],
        isActive: false,
        items: []
      },
      {
        title: 'nav.categories',
        url: '/dashboard/categories',
        icon: 'folder',
        isActive: false,
        items: []
      },
      {
        title: 'nav.brands',
        url: '/dashboard/brands',
        icon: 'tag',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'nav.group.stock',
    items: [
      {
        title: 'nav.purchases',
        url: '/dashboard/purchases',
        icon: 'truck',
        isActive: false,
        items: []
      },
      {
        title: 'nav.inventory',
        url: '/dashboard/inventory',
        icon: 'box',
        isActive: false,
        items: []
      },
      {
        title: 'nav.adjustments',
        url: '/dashboard/stock-adjustments',
        icon: 'adjustments',
        isActive: false,
        items: []
      },
      {
        title: 'nav.movements',
        url: '/dashboard/inventory-movements',
        icon: 'history',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'nav.group.sales',
    items: [
      {
        title: 'nav.sales',
        url: '/dashboard/sales',
        icon: 'receipt',
        shortcut: ['s', 's'],
        isActive: false,
        items: []
      },
      {
        title: 'nav.customers',
        url: '/dashboard/customers',
        icon: 'teams',
        isActive: false,
        items: []
      },
      {
        title: 'nav.payments',
        url: '/dashboard/payments',
        icon: 'cash',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'nav.group.money',
    items: [
      {
        title: 'nav.supplierPayments',
        url: '/dashboard/supplier-payments',
        icon: 'creditCard',
        isActive: false,
        items: []
      },
      {
        title: 'nav.expenses',
        url: '/dashboard/expenses',
        icon: 'wallet',
        isActive: false,
        items: []
      },
      {
        title: 'nav.expenseCategories',
        url: '/dashboard/expense-categories',
        icon: 'folder',
        isActive: false,
        items: []
      },
      {
        title: 'nav.cashLedger',
        url: '/dashboard/cash',
        icon: 'cash',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'nav.group.people',
    items: [
      {
        title: 'nav.suppliers',
        url: '/dashboard/suppliers',
        icon: 'building',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'nav.group.settings',
    items: [
      {
        title: 'nav.appearance',
        url: '/dashboard/settings/appearance',
        icon: 'palette',
        isActive: false,
        items: []
      }
    ]
  }
];

export function getNavGroupsForRole(role: SessionRole | undefined): NavGroup[] {
  if (role === 'SUPER_ADMIN') return platformNavGroups;
  return shopNavGroups;
}

export const navGroups = shopNavGroups;
