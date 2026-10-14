'use client';

import type { Table } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { DataTablePaginationProps } from './types';

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [20, 30, 50, 100],
  variant = 'full',
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const t = useTranslations();
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = table.getRowCount();
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(total, (pageIndex + 1) * pageSize);
  const compact = variant === 'compact';

  return (
    <div
      className={cn('flex w-full flex-wrap items-center justify-between gap-2 p-1', className)}
      {...props}
    >
      <div className='text-muted-foreground text-sm whitespace-nowrap'>
        {t('table.rowsRange', { from, to, total })}
      </div>

      <div className='flex items-center gap-2'>
        {!compact ? (
          <div className='hidden items-center gap-2 sm:flex'>
            <p className='text-sm font-medium whitespace-nowrap'>{t('table.rowsPerPage')}</p>
            <Select
              items={pageSizeOptions.map((size) => ({
                value: `${size}`,
                label: `${size}`
              }))}
              value={`${pageSize}`}
              onValueChange={(value) => {
                if (value != null) table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className='h-8 w-[4.5rem] [&[data-size]]:h-8'>
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side='top'>
                <SelectGroup>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className='flex items-center gap-1'>
          {!compact ? (
            <Button
              aria-label={t('table.firstPage')}
              variant='outline'
              size='icon'
              className='hidden size-8 lg:flex'
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <Icons.chevronsLeft className='rtl:rotate-180' />
            </Button>
          ) : null}
          <Button
            aria-label={t('table.prevPage')}
            variant='outline'
            size={compact ? 'default' : 'icon'}
            className={compact ? 'h-11 min-w-11 px-3' : 'size-8'}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {compact ? t('table.prev') : <Icons.chevronLeft className='rtl:rotate-180' />}
          </Button>
          <Button
            aria-label={t('table.nextPage')}
            variant='outline'
            size={compact ? 'default' : 'icon'}
            className={compact ? 'h-11 min-w-11 px-3' : 'size-8'}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {compact ? t('table.next') : <Icons.chevronRight className='rtl:rotate-180' />}
          </Button>
          {!compact ? (
            <Button
              aria-label={t('table.lastPage')}
              variant='outline'
              size='icon'
              className='hidden size-8 lg:flex'
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <Icons.chevronsRight className='rtl:rotate-180' />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
