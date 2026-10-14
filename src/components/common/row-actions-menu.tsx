'use client';

import { useRouter } from '@/i18n/navigation';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useT } from '@/i18n/use-t';
import type { RowActionsMenuProps } from '@/types';

export function RowActionsMenu({ actions }: RowActionsMenuProps) {
  const t = useT();
  const router = useRouter();
  if (actions.length === 0) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            type='button'
            variant='ghost'
            className='size-11 min-h-11 min-w-11 p-0 sm:size-8 sm:min-h-8 sm:min-w-8'
          />
        }
      >
        <span className='sr-only'>{t('common.openMenu')}</span>
        <Icons.ellipsis className='h-4 w-4' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
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
                <Icon className='me-2 h-4 w-4' />
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
