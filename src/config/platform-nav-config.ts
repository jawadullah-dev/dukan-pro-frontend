import { NavGroup } from '@/types';

/** Platform super-admin navigation — flat links like shop admin (no dropdowns). */
export const platformNavGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/platform',
        icon: 'dashboard',
        shortcut: ['d', 'd'],
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'Management',
    items: [
      {
        title: 'Shops',
        url: '/dashboard/platform/shops',
        icon: 'building',
        isActive: false,
        items: []
      },
      {
        title: 'Subscriptions',
        url: '/dashboard/platform/subscriptions',
        icon: 'creditCard',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'Settings',
    items: [
      {
        title: 'Appearance',
        url: '/dashboard/settings/appearance',
        icon: 'palette',
        isActive: false,
        items: []
      }
    ]
  }
];
