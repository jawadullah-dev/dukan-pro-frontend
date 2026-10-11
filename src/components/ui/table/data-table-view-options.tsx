'use client';

import type { Table } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { useT, translateMaybe } from '@/i18n/use-t';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  const t = useT();
  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide()),
    [table]
  );

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            aria-label={t('table.toggleColumns')}
            variant='outline'
            size='sm'
            className='ms-auto hidden h-8 lg:flex'
          />
        }
      >
        <Icons.adjustments />
        {t('table.view')}
        <Icons.chevronsUpDown className='ms-auto opacity-50' />
      </PopoverTrigger>
      <PopoverContent align='end' className='w-56 p-0'>
        <Command>
          <CommandInput placeholder={t('table.searchColumns')} />
          <CommandList>
            <CommandEmpty>{t('table.noColumnsFound')}</CommandEmpty>
            <CommandGroup className='p-1.5 [&_[cmdk-group-items]]:space-y-1'>
              {columns.map((column) => (
                <CommandItem
                  key={column.id}
                  onSelect={() => column.toggleVisibility(!column.getIsVisible())}
                  className='my-0.5 flex items-center justify-between gap-2 py-2'
                >
                  <span className='min-w-0 flex-1 truncate'>
                    {column.columnDef.meta?.label
                      ? translateMaybe(column.columnDef.meta.label, t)
                      : column.id.replaceAll('_', ' ')}
                  </span>
                  <Icons.check
                    className={cn(
                      'size-4 shrink-0',
                      column.getIsVisible() ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
