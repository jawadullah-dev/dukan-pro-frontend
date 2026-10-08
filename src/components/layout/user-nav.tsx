'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import { sessionQueryOptions } from '@/features/dukaan/api/queries';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Icons } from '@/components/icons';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { clearPwaCaches } from '@/lib/pwa';
import { useT } from '@/i18n/use-t';

function ProfileAvatar({ className }: { className?: string }) {
  return (
    <Avatar className={className}>
      <AvatarFallback className='bg-muted'>
        <Icons.user className='text-muted-foreground size-4' />
      </AvatarFallback>
    </Avatar>
  );
}

function AccountMenuItems({ userName, shopName }: { userName: string; shopName: string }) {
  const t = useT();
  const [signingOut, setSigningOut] = React.useState(false);

  const onSignOut = () => {
    if (signingOut) return;
    setSigningOut(true);
    void (async () => {
      try {
        await clearPwaCaches();
        await signOut({ callbackUrl: '/login' });
      } catch {
        setSigningOut(false);
      }
    })();
  };

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col gap-1 px-0.5 py-0.5'>
            <p className='text-sm leading-none font-medium'>{userName}</p>
            <p className='text-muted-foreground truncate text-xs leading-none'>{shopName}</p>
          </div>
        </DropdownMenuLabel>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <div className='px-1 py-0.5'>
        <InstallPrompt variant='menu' />
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant='destructive' disabled={signingOut} onClick={onSignOut}>
        {signingOut ? (
          <Spinner className='me-2 size-4' aria-hidden />
        ) : (
          <Icons.logout className='me-2 h-4 w-4' />
        )}
        {signingOut ? t('nav.signingOut') : t('nav.signOut')}
      </DropdownMenuItem>
    </>
  );
}

/** Compact profile avatar for the top header (next to notifications). */
export function UserNav() {
  const t = useT();
  const { data, isPending } = useQuery(sessionQueryOptions());

  if (isPending) {
    return <Skeleton className='h-8 w-8 rounded-full' />;
  }

  if (!data) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            className='relative h-8 w-8 rounded-full'
            aria-label={t('nav.accountMenu')}
          />
        }
      >
        <ProfileAvatar className='h-8 w-8' />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' sideOffset={8}>
        <AccountMenuItems userName={data.user_name} shopName={data.shop_name} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Sidebar footer account row — same session + logout for both roles. */
export function SidebarUserMenu() {
  const t = useT();
  const { data, isPending } = useQuery(sessionQueryOptions());

  if (isPending) {
    return (
      <div className='flex items-center gap-2 p-2'>
        <Skeleton className='h-8 w-8 rounded-full' />
        <div className='grid flex-1 gap-1'>
          <Skeleton className='h-3 w-24' />
          <Skeleton className='h-3 w-16' />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size='lg'
            className='data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground'
            aria-label={t('nav.accountMenu')}
          />
        }
      >
        <ProfileAvatar className='h-8 w-8 shrink-0' />
        <div className='grid min-w-0 flex-1 text-start text-sm leading-tight'>
          <span className='truncate font-medium'>{data.user_name}</span>
          <span className='text-muted-foreground truncate text-xs'>{data.shop_name}</span>
        </div>
        <Icons.chevronsUpDown className='ms-auto size-4 shrink-0' />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-(--anchor-width) min-w-56 rounded-lg'
        side='top'
        align='end'
        sideOffset={4}
      >
        <AccountMenuItems userName={data.user_name} shopName={data.shop_name} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
