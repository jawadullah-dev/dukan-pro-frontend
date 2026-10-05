'use client';

import { useQuery } from '@tanstack/react-query';
import { sessionQueryOptions } from '@/features/dukaan/api/queries';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function UserNav() {
  const { data } = useQuery(sessionQueryOptions());
  if (!data) return null;

  const initials = data.user_name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className='flex items-center gap-2 px-1'>
      <Avatar className='h-8 w-8'>
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className='hidden flex-col text-left text-xs sm:flex'>
        <span className='font-medium'>{data.user_name}</span>
        <span className='text-muted-foreground'>{data.shop_name}</span>
      </div>
    </div>
  );
}
