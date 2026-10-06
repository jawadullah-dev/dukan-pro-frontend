'use client';

import React from 'react';
import { useKBar } from 'kbar';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import { ThemeSelector } from '../themes/theme-selector';
import { ThemeModeToggle } from '../themes/theme-mode-toggle';
import { NotificationCenter } from '@/features/notifications/components/notification-center';
import { UserNav } from '@/components/layout/user-nav';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { t } from '@/i18n';

function pageTitleFromPath(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'Dashboard';
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Detail routes need an in-app back control (standalone PWA has no browser chrome). */
function isDetailPath(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'dashboard') return false;
  return parts.length >= 3;
}

export default function Header() {
  const { query } = useKBar();
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitleFromPath(pathname);
  const showBack = isDetailPath(pathname);

  return (
    <header className='bg-background/95 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/60 pt-[env(safe-area-inset-top)] backdrop-blur-md md:h-14'>
      <div className='flex min-w-0 flex-1 items-center gap-2 px-4'>
        {showBack ? (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-11 shrink-0'
            aria-label={t('nav.back')}
            onClick={() => router.back()}
          >
            <Icons.chevronLeft className='size-5' />
          </Button>
        ) : (
          <SidebarTrigger className='-ms-1' aria-label={t('nav.menu')} />
        )}
        <Separator
          orientation='vertical'
          className='me-2 hidden h-4 data-vertical:self-center sm:block'
        />
        <p className='truncate text-sm font-semibold sm:hidden'>{title}</p>
        <div className='hidden sm:block'>
          <Breadcrumbs />
        </div>
      </div>

      <div className='flex shrink-0 items-center gap-1 px-4 sm:gap-2'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-11 sm:hidden'
          aria-label={t('nav.search')}
          onClick={query.toggle}
        >
          <Icons.search className='size-5' />
        </Button>
        <div className='hidden md:flex'>
          <SearchInput />
        </div>
        <div className='hidden sm:block'>
          <ThemeModeToggle />
        </div>
        <div className='hidden md:block'>
          <ThemeSelector />
        </div>
        <NotificationCenter />
        <UserNav />
      </div>
    </header>
  );
}
