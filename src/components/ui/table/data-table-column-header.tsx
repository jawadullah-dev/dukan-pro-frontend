'use client';

import * as React from 'react';
import type { Column } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<TData, TValue> extends React.ComponentProps<typeof Button> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  return (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      onClick={() => column.toggleSorting(isSorted === 'asc')}
      className={cn(
        'hover:bg-accent focus:ring-ring [&_svg]:text-muted-foreground -ms-1.5 flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium focus:ring-1 focus:outline-none [&_svg]:size-4 [&_svg]:shrink-0',
        className
      )}
      {...props}
    >
      <span>{title}</span>
      {isSorted === 'desc' ? (
        <Icons.chevronDown />
      ) : isSorted === 'asc' ? (
        <Icons.chevronUp />
      ) : (
        <Icons.chevronsUpDown className='opacity-50' />
      )}
    </Button>
  );
}
