'use client';

import { getNavGroupsForRole } from '@/config/nav-config';
import type { SessionRole } from '@/lib/dukaan/session';
import type { NavGroup, NavItem } from '@/types';

function useFilteredNavItems(items: NavItem[]) {
  return items;
}

export function useFilteredNavGroups(groups: NavGroup[], role?: SessionRole) {
  if (role) return getNavGroupsForRole(role);
  return groups;
}
