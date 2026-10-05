'use client';

import { useRouter } from 'next/navigation';
import type { ComponentType } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export interface RowAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
}

export function RowActionsMenu({ actions }: { actions: RowAction[] }) {
  const router = useRouter();
  if (actions.length === 0) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
        <span className='sr-only'>Open menu</span>
        <Icons.ellipsis className='h-4 w-4' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          {actions.map((action) => {
            const Icon = action.icon ?? Icons.chevronRight;
            return (
              <DropdownMenuItem
                key={action.label}
                variant={action.variant}
                onClick={() => {
                  requestAnimationFrame(() => {
                    if (action.onClick) action.onClick();
                    else if (action.href) router.push(action.href);
                  });
                }}
              >
                <Icon className='mr-2 h-4 w-4' />
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
