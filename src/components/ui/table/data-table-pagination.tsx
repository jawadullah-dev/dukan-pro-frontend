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
import { useT } from '@/i18n/use-t';

interface DataTablePaginationProps<TData> extends React.ComponentProps<'div'> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [20, 30, 50, 100],
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const t = useT();
  return (
    <div
      className={cn(
        'flex w-full flex-wrap items-center justify-between gap-2 overflow-auto p-1 sm:gap-8',
        className
      )}
      {...props}
    >
      <div className='text-muted-foreground text-sm whitespace-nowrap'>
        {table.getFilteredSelectedRowModel().rows.length > 0 ? (
          <>
            {t('table.rowsSelected', {
              selected: table.getFilteredSelectedRowModel().rows.length,
              total: table.getRowCount()
            })}
          </>
        ) : (
          <>{t('table.rowsTotal', { total: table.getRowCount() })}</>
        )}
      </div>
      <div className='flex items-center gap-2 sm:gap-6 lg:gap-8'>
        <div className='hidden items-center gap-2 sm:flex'>
          <p className='text-sm font-medium whitespace-nowrap'>{t('table.rowsPerPage')}</p>
          <Select
            items={pageSizeOptions.map((pageSize) => ({
              value: `${pageSize}`,
              label: `${pageSize}`
            }))}
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              if (value != null) table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className='h-8 w-[4.5rem] [&[data-size]]:h-8'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              <SelectGroup>
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-center justify-center text-sm font-medium whitespace-nowrap'>
          {t('table.pageInfo', {
            current: table.getState().pagination.pageIndex + 1,
            total: table.getPageCount()
          })}
        </div>
        <div className='flex items-center gap-1'>
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
          <Button
            aria-label={t('table.prevPage')}
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <Icons.chevronLeft className='rtl:rotate-180' />
          </Button>
          <Button
            aria-label={t('table.nextPage')}
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <Icons.chevronRight className='rtl:rotate-180' />
          </Button>
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
        </div>
      </div>
    </div>
  );
}
