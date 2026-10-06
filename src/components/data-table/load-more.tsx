'use client';

import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';

interface LoadMoreProps<TData> {
  table: Table<TData>;
  step?: number;
}

/**
 * Phone pagination: grows page size instead of numbered pages.
 * Shows "Showing X of Y" + Load more until all rows are loaded.
 */
export function LoadMore<TData>({ table, step = 20 }: LoadMoreProps<TData>) {
  const t = useT();
  const total = table.getRowCount();
  const pageSize = table.getState().pagination.pageSize;
  const showing = Math.min(pageSize, total);
  const canLoadMore = pageSize < total;

  return (
    <div className='flex flex-col items-center gap-2 py-2'>
      <p className='text-muted-foreground text-xs'>{t('table.showingOf', { showing, total })}</p>
      {canLoadMore ? (
        <Button
          type='button'
          variant='outline'
          className='h-11 w-full max-w-sm'
          onClick={() => table.setPageSize(Math.min(pageSize + step, total))}
        >
          {t('table.loadMore')}
        </Button>
      ) : null}
    </div>
  );
}
