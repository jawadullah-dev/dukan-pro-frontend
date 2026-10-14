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
import { useFilteredNavGroups } from '@/hooks/use-nav';
import type { NavGroup, NavItem, AppSidebarProps } from '@/types';
export type { AppSidebarProps };
import { Link, usePathname } from '@/i18n/navigation';
import { useSelectedLayoutSegment } from 'next/navigation';
import * as React from 'react';
import { Icons } from '@/components/icons';
import { useLocale, useTranslations } from 'next-intl';
import { isRtlLocale, type AppLocale } from '@/i18n/request';

function filterNavGroups(
  groups: NavGroup[],
  query: string,
  labelOf: (key: string) => string
): NavGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;

  return groups
    .map((group) => {
      const items = group.items.flatMap((item): NavItem[] => {
        const titleMatch = labelOf(item.title).toLowerCase().includes(q);
        const matchingSubs =
          item.items?.filter((sub) => labelOf(sub.title).toLowerCase().includes(q)) ?? [];

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

function translateMaybe(key: string, t: ReturnType<typeof useTranslations>): string {
  const translated = t(key);
  return translated.startsWith('MISSING_MESSAGE') ? key : translated;
}

export default function AppSidebar({ role }: AppSidebarProps) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const isRtl = isRtlLocale(locale);
  const labelOf = React.useCallback((key: string) => translateMaybe(key, t), [t]);
  const pathname = usePathname();
  const segment = useSelectedLayoutSegment();
  const { isMobile, setOpenMobile } = useSidebar();
  const initialGroups = React.useMemo(() => getNavGroupsForRole(role), [role]);
  const filteredGroups = useFilteredNavGroups(initialGroups, role);
  const [search, setSearch] = React.useState('');
  const visibleGroups = React.useMemo(
    () => filterNavGroups(filteredGroups, search, labelOf),
    [filteredGroups, search, labelOf]
  );
  const isSearching = search.trim().length > 0;

  const closeMobileNav = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar side={isRtl ? 'right' : 'left'} dir={isRtl ? 'rtl' : 'ltr'} collapsible='icon'>
      <SidebarHeader className='border-b border-sidebar-border group-data-[collapsible=icon]:hidden'>
        <div className='relative'>
          <Icons.search className='text-muted-foreground pointer-events-none absolute top-1/2 start-2 size-4 -translate-y-1/2' />
          <SidebarInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('nav.searchTabs')}
            aria-label={t('nav.search')}
            className='ps-8 pe-8'
          />
          {isSearching ? (
            <button
              type='button'
              aria-label={t('table.clear')}
              className='text-muted-foreground hover:text-foreground absolute top-1/2 end-2 -translate-y-1/2 cursor-pointer'
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
            {t('nav.noMatchingTabs')}
          </div>
        ) : null}
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label || 'ungrouped'} className='py-0'>
            {group.label ? <SidebarGroupLabel>{labelOf(group.label)}</SidebarGroupLabel> : null}
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                const title = labelOf(item.title);
                const isActive =
                  pathname === item.url ||
                  (segment !== null && item.url === `/dashboard/${segment}`) ||
                  (item.url !== '/dashboard/platform' &&
                    item.url !== '/dashboard/overview' &&
                    pathname.startsWith(`${item.url}/`));

                return item?.items && item?.items?.length > 0 ? (
                  <Collapsible
                    key={item.url}
                    defaultOpen={item.isActive || isSearching || isActive}
                    open={isSearching ? true : undefined}
                    render={<SidebarMenuItem />}
                  >
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          tooltip={title}
                          isActive={isActive}
                          className='group/collapsible text-start'
                        />
                      }
                    >
                      {item.icon && <Icon />}
                      <span>{title}</span>
                      <Icons.chevronRight className='ms-auto transition-transform duration-200 rtl:rotate-180 group-data-panel-open/collapsible:rotate-90 rtl:group-data-panel-open/collapsible:rotate-90' />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const subTitle = labelOf(subItem.title);
                          return (
                            <SidebarMenuSubItem key={subItem.url}>
                              <SidebarMenuSubButton
                                render={
                                  <Link
                                    href={subItem.url}
                                    aria-label={subTitle}
                                    onClick={closeMobileNav}
                                  />
                                }
                                isActive={pathname === subItem.url}
                                className='text-start'
                              >
                                <span>{subTitle}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} aria-label={title} onClick={closeMobileNav} />}
                      tooltip={title}
                      isActive={isActive}
                      className='text-start'
                    >
                      <Icon />
                      <span>{title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className='group-data-[collapsible=icon]:hidden'>
        <p className='text-muted-foreground px-2 py-1 text-xs'>{t('common.appName')}</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
