'use client';

import * as React from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { Icons } from '@/components/icons';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { getNavGroupsForRole } from '@/config/nav-config';
import { useFilteredNavGroups } from '@/hooks/use-nav';
import { useIsPhone } from '@/hooks/use-mobile';
import type { SessionRole } from '@/lib/dukaan/session';
import type { NavItem } from '@/types';
import { useT, translateMaybe } from '@/i18n/use-t';
import { cn } from '@/lib/utils';

const SHOP_PRIMARY = [
  '/dashboard/overview',
  '/dashboard/sales',
  '/dashboard/purchases',
  '/dashboard/customers'
] as const;

const PLATFORM_PRIMARY = [
  '/dashboard/platform',
  '/dashboard/platform/shops',
  '/dashboard/platform/subscriptions',
  '/dashboard/settings/appearance'
] as const;

function flattenNav(groups: ReturnType<typeof getNavGroupsForRole>): NavItem[] {
  return groups.flatMap((g) =>
    g.items.flatMap((item) => {
      if (item.items && item.items.length > 0) return item.items;
      return [item];
    })
  );
}

function isActivePath(pathname: string, url: string): boolean {
  if (pathname === url) return true;
  if (url !== '/dashboard' && pathname.startsWith(`${url}/`)) return true;
  return false;
}

/** Phone-only bottom bar: 4 primary destinations + More sheet. */
export function MobileBottomNav({ role }: { role: SessionRole }) {
  const t = useT();
  const isPhone = useIsPhone();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const groups = useFilteredNavGroups(getNavGroupsForRole(role), role);
  const allItems = React.useMemo(() => flattenNav(groups), [groups]);

  const primaryUrls = role === 'SUPER_ADMIN' ? PLATFORM_PRIMARY : SHOP_PRIMARY;
  const primary = primaryUrls
    .map((url) => allItems.find((item) => item.url === url))
    .filter((item): item is NavItem => Boolean(item));

  const primarySet = new Set(primary.map((item) => item.url));
  const moreItems = allItems.filter((item) => item.url && !primarySet.has(item.url));

  if (!isPhone) return null;

  return (
    <>
      <nav
        aria-label={t('nav.menu')}
        className={cn(
          'bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t border-border backdrop-blur-md',
          'pb-[env(safe-area-inset-bottom)] lg:hidden'
        )}
      >
        <ul className='mx-auto flex h-14 max-w-lg items-stretch justify-around px-1'>
          {primary.map((item) => {
            const Icon = item.icon ? Icons[item.icon] : Icons.circle;
            const active = isActivePath(pathname, item.url);
            return (
              <li key={item.url} className='flex flex-1'>
                <Link
                  href={item.url}
                  className={cn(
                    'flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon className='size-5' />
                  <span className='max-w-full truncate'>{translateMaybe(item.title, t)}</span>
                </Link>
              </li>
            );
          })}
          <li className='flex flex-1'>
            <button
              type='button'
              className={cn(
                'flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium',
                moreOpen ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-label={t('nav.more')}
              onClick={() => setMoreOpen(true)}
            >
              <Icons.dots className='size-5' />
              <span>{t('nav.more')}</span>
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side='bottom'
          className='max-h-[75dvh] rounded-t-[var(--radius)] pb-[max(1rem,env(safe-area-inset-bottom))]'
        >
          <div className='bg-muted mx-auto mt-1 mb-2 h-1 w-10 shrink-0 rounded-full' aria-hidden />
          <SheetHeader>
            <SheetTitle>{t('nav.more')}</SheetTitle>
          </SheetHeader>
          <ul className='no-scrollbar grid gap-1 overflow-y-auto px-2 pb-4'>
            {moreItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.circle;
              const active = isActivePath(pathname, item.url);
              return (
                <li key={item.url}>
                  <Link
                    href={item.url}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm',
                      active ? 'bg-muted font-medium' : 'hover:bg-muted/60'
                    )}
                  >
                    <Icon className='size-5 shrink-0' />
                    {translateMaybe(item.title, t)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
