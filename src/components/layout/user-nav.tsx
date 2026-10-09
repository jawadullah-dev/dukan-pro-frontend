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

interface ProfileAvatarProps {
  className?: string;
}

function ProfileAvatar({ className }: ProfileAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarFallback className='bg-muted'>
        <Icons.user className='text-muted-foreground size-4' />
      </AvatarFallback>
    </Avatar>
  );
}

interface AccountMenuItemsProps {
  userName: string;
  shopName: string;
}

function AccountMenuItems({ userName, shopName }: AccountMenuItemsProps) {
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
