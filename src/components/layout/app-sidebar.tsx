'use client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { getNavGroupsForRole } from '@/config/nav-config';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFilteredNavGroups } from '@/hooks/use-nav';
import type { SessionRole } from '@/lib/dukaan/session';
import type { NavGroup, NavItem } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Icons } from '@/components/icons';

function filterNavGroups(groups: NavGroup[], query: string): NavGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;

  return groups
    .map((group) => {
      const items = group.items.flatMap((item): NavItem[] => {
        const titleMatch = item.title.toLowerCase().includes(q);
        const matchingSubs = item.items?.filter((sub) => sub.title.toLowerCase().includes(q)) ?? [];

        if (titleMatch) return [item];
        if (matchingSubs.length > 0) {
          return [{ ...item, items: matchingSubs, isActive: true }];
        }
        return [];
      });

      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);
}

export default function AppSidebar({ role }: { role: SessionRole }) {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { isMobile, setOpenMobile } = useSidebar();
  const initialGroups = React.useMemo(() => getNavGroupsForRole(role), [role]);
  const filteredGroups = useFilteredNavGroups(initialGroups, role);
  const [search, setSearch] = React.useState('');
  const visibleGroups = React.useMemo(
    () => filterNavGroups(filteredGroups, search),
    [filteredGroups, search]
  );
  const isSearching = search.trim().length > 0;

  const closeMobileNav = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='border-b border-sidebar-border group-data-[collapsible=icon]:hidden'>
        <div className='relative'>
          <Icons.search className='text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2' />
          <SidebarInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search tabs...'
            aria-label='Search navigation tabs'
            className='pr-8 pl-8'
          />
          {isSearching ? (
            <button
              type='button'
              aria-label='Clear search'
              className='text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer'
              onClick={() => setSearch('')}
            >
              <Icons.close className='size-4' />
            </button>
          ) : null}
        </div>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        {visibleGroups.length === 0 ? (
          <div className='text-muted-foreground px-3 py-6 text-center text-sm group-data-[collapsible=icon]:hidden'>
            No tabs found
          </div>
        ) : null}
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label || 'ungrouped'} className='py-0'>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                const isActive =
                  pathname === item.url ||
                  (item.url !== '/dashboard/platform' &&
                    item.url !== '/dashboard/overview' &&
                    pathname.startsWith(item.url));

                return item?.items && item?.items?.length > 0 ? (
                  <Collapsible
                    key={item.title}
                    defaultOpen={item.isActive || isSearching || isActive}
                    open={isSearching ? true : undefined}
                    render={<SidebarMenuItem />}
                  >
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isActive}
                          className='group/collapsible'
                        />
                      }
                    >
                      {item.icon && <Icon />}
                      <span>{item.title}</span>
                      <Icons.chevronRight className='ml-auto transition-transform duration-200 group-data-panel-open/collapsible:rotate-90' />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              render={
                                <Link
                                  href={subItem.url}
                                  aria-label={subItem.title}
                                  onClick={closeMobileNav}
                                />
                              }
                              isActive={pathname === subItem.url}
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={
                        <Link href={item.url} aria-label={item.title} onClick={closeMobileNav} />
                      }
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className='group-data-[collapsible=icon]:hidden'>
        <p className='text-muted-foreground px-2 py-1 text-xs'>Dukaan Pro</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
