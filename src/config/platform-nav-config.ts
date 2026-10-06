import { NavGroup } from '@/types';

/** Platform super-admin navigation — titles/labels are i18n keys. */
export const platformNavGroups: NavGroup[] = [
  {
    label: 'nav.group.overview',
    items: [
      {
        title: 'nav.dashboard',
        url: '/dashboard/platform',
        icon: 'dashboard',
        shortcut: ['d', 'd'],
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'nav.group.management',
    items: [
      {
        title: 'nav.shops',
        url: '/dashboard/platform/shops',
        icon: 'building',
        isActive: false,
        items: []
      },
      {
        title: 'nav.subscriptions',
        url: '/dashboard/platform/subscriptions',
        icon: 'creditCard',
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
