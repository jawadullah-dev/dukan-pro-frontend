'use client';

import * as React from 'react';
import type { Row, Table } from '@tanstack/react-table';
import { MobileListItem } from './mobile-list-item';
import { RecordDetail } from './record-detail';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import type { DetailConfig, MobileItemConfig } from './types';

interface MobileListProps<TData> {
  table: Table<TData>;
  mobileItem: MobileItemConfig<TData>;
  detail: DetailConfig<TData>;

  preferNavigate?: boolean;
  isLoading?: boolean;
  skeletonRowCount?: number;
  onNavigate?: (href: string) => void;
}

export function MobileList<TData>({
  table,
  mobileItem,
  detail,
  preferNavigate = true,
  isLoading,
  skeletonRowCount,
  onNavigate
}: MobileListProps<TData>) {
  const t = useTranslations();
  const [active, setActive] = React.useState<Row<TData> | null>(null);
  const rows = table.getRowModel().rows;

  const openRow = (row: Row<TData>) => {
    if (detail.mode === 'page' && preferNavigate && detail.href && onNavigate) {
      onNavigate(detail.href(row.original));
      return;
    }
    setActive(row);
  };

  if (isLoading) {
    const count =
      (rows.length > 0 ? rows.length : null) ??
      (table.options.data?.length > 0 ? table.options.data.length : null) ??
      skeletonRowCount ??
      3;

    return (
      <div className='overflow-hidden rounded-[var(--radius)] border border-border' aria-busy>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className='border-b border-border px-3 py-3 last:border-b-0'>
            <Skeleton className='h-12 w-full' />
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className='text-muted-foreground flex min-h-40 items-center justify-center rounded-[var(--radius)] border border-border text-sm'>
        {t('table.noResults')}
      </div>
    );
  }

  return (
    <>
      <ul className='overflow-hidden rounded-[var(--radius)] border border-border'>
        {rows.map((row) => (
          <li key={row.id} className='border-b border-border last:border-b-0'>
            <MobileListItem row={row.original} config={mobileItem} onOpen={() => openRow(row)} />
          </li>
        ))}
      </ul>

      <RecordDetail
        open={active != null}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
        presentation='sheet'
        data={active?.original ?? null}
        detail={detail}
      />
    </>
  );
}
