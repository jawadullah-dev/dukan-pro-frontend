'use client';

import { getNavGroupsForRole } from '@/config/nav-config';
import type { SessionRole } from '@/lib/dukaan/session';
import type { NavGroup, NavItem } from '@/types';

export function useFilteredNavItems(items: NavItem[]) {
  return items;
}

/** Prefer the server-provided role so the sidebar never flashes shop nav for super admin. */
export function useFilteredNavGroups(groups: NavGroup[], role?: SessionRole) {
  if (role) return getNavGroupsForRole(role);
  return groups;
}
