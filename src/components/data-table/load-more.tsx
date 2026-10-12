'use client';

import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import { IconLoader2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

interface LoadMoreProps<TData> {
  table: Table<TData>;
  step?: number;
}

export function LoadMore<TData>({ table, step = 20 }: LoadMoreProps<TData>) {
  const t = useTranslations();
  const total = table.getRowCount();
  const pageSize = table.getState().pagination.pageSize;
  const showing = Math.min(pageSize, total);
  const canLoadMore = pageSize < total;

  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const isUpdatingRef = React.useRef(false);

  React.useEffect(() => {
    isUpdatingRef.current = false;
  }, [pageSize]);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !canLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !isUpdatingRef.current) {
          isUpdatingRef.current = true;
          table.setPageSize(Math.min(pageSize + step, total));
        }
      },
      {
        rootMargin: '200px 0px',
        threshold: 0.05
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoadMore, pageSize, step, total, table]);

  return (
    <div className='flex flex-col items-center gap-2 py-4'>
      <p className='text-muted-foreground text-xs'>{t('table.showingOf', { showing, total })}</p>
      {canLoadMore ? (
        <div
          ref={sentinelRef}
          className='flex items-center justify-center gap-2 py-2 text-muted-foreground'
          aria-live='polite'
          aria-busy='true'
        >
          <IconLoader2 className='size-5 animate-spin text-primary' />
          <span className='text-xs font-medium'>{t('common.loading')}</span>
        </div>
      ) : null}
    </div>
  );
}
