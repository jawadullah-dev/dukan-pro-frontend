import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  },
  {
    label: 'Catalog',
    items: [
      {
        title: 'Products',
        url: '/dashboard/products',
        icon: 'product',
        shortcut: ['p', 'p'],
        isActive: false,
        items: []
      },
      {
        title: 'Categories',
        url: '/dashboard/categories',
        icon: 'folder',
        isActive: false,
        items: []
      },
      {
        title: 'Brands',
        url: '/dashboard/brands',
        icon: 'tag',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'Stock',
    items: [
      {
        title: 'Purchases',
        url: '/dashboard/purchases',
        icon: 'truck',
        isActive: false,
        items: []
      },
      {
        title: 'Inventory',
        url: '/dashboard/inventory',
        icon: 'box',
        isActive: false,
        items: []
      },
      {
        title: 'Adjustments',
        url: '/dashboard/stock-adjustments',
        icon: 'adjustments',
        isActive: false,
        items: []
      },
      {
        title: 'Movements',
        url: '/dashboard/inventory-movements',
        icon: 'history',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'Sales',
    items: [
      {
        title: 'Sales',
        url: '/dashboard/sales',
        icon: 'receipt',
        shortcut: ['s', 's'],
        isActive: false,
        items: []
      },
      {
        title: 'Customers',
        url: '/dashboard/customers',
        icon: 'teams',
        isActive: false,
        items: []
      },
      {
        title: 'Payments',
        url: '/dashboard/payments',
        icon: 'cash',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'Money',
    items: [
      {
        title: 'Supplier Payments',
        url: '/dashboard/supplier-payments',
        icon: 'creditCard',
        isActive: false,
        items: []
      },
      {
        title: 'Expenses',
        url: '/dashboard/expenses',
        icon: 'wallet',
        isActive: false,
        items: []
      },
      {
        title: 'Expense Categories',
        url: '/dashboard/expense-categories',
        icon: 'folder',
        isActive: false,
        items: []
      },
      {
        title: 'Cash Ledger',
        url: '/dashboard/cash',
        icon: 'cash',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'People',
    items: [
      {
        title: 'Suppliers',
        url: '/dashboard/suppliers',
        icon: 'building',
        isActive: false,
        items: []
      }
    ]
  }
];
