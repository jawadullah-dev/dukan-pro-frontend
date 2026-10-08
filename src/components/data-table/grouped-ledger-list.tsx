'use client';

import * as React from 'react';
import type { Row, Table } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { RecordDetail } from './record-detail';
import type { DetailConfig, MobileItemConfig } from './types';

interface GroupedLedgerListProps<TData> {
  table: Table<TData>;
  /** ISO date or display date string used for grouping. */
  getDateKey: (row: TData) => string;
  mobileItem: MobileItemConfig<TData>;
  detail: DetailConfig<TData>;
  onNavigate?: (href: string) => void;
}

function dateHeading(key: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(key)) return key.slice(0, 10);
  return key;
}

/** Banking-style list: sticky date headers + signed amount rows. */
export function GroupedLedgerList<TData>({
  table,
  getDateKey,
  mobileItem,
  detail,
  onNavigate
}: GroupedLedgerListProps<TData>) {
  const t = useTranslations();
  const [active, setActive] = React.useState<Row<TData> | null>(null);
  const rows = table.getRowModel().rows;

  const groups = React.useMemo(() => {
    const map = new Map<string, Row<TData>[]>();
    for (const row of rows) {
      const key = dateHeading(getDateKey(row.original));
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [rows, getDateKey]);

  const openRow = (row: Row<TData>) => {
    if (detail.mode === 'page' && detail.href && onNavigate) {
      onNavigate(detail.href(row.original));
      return;
    }
    setActive(row);
  };

  if (rows.length === 0) {
    return (
      <div className='text-muted-foreground flex min-h-40 items-center justify-center rounded-[var(--radius)] border border-border text-sm'>
        {t('table.noResults')}
      </div>
    );
  }

  return (
    <>
      <div className='overflow-hidden rounded-[var(--radius)] border border-border'>
        {groups.map(([date, groupRows]) => (
          <section key={date}>
            <h3 className='bg-muted/80 text-muted-foreground sticky top-0 z-10 border-b border-border px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase'>
              {date}
            </h3>
            <ul>
              {groupRows.map((row) => {
                const title = mobileItem.title(row.original);
                const subtitle = mobileItem.subtitle?.(row.original);
                const value = mobileItem.value?.(row.original);
                const valueLabel =
                  typeof mobileItem.valueLabel === 'function'
                    ? mobileItem.valueLabel(row.original)
                    : mobileItem.valueLabel;
                const aria =
                  mobileItem.ariaLabel?.(row.original) ??
                  (typeof title === 'string' ? title : undefined);

                return (
                  <li key={row.id} className='border-b border-border last:border-b-0'>
                    <button
                      type='button'
                      aria-label={aria}
                      onClick={() => openRow(row)}
                      className='flex min-h-16 w-full items-start gap-3 px-3 py-2.5 text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
                    >
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-semibold'>{title}</p>
                        {subtitle != null ? (
                          <p className='text-muted-foreground truncate text-xs'>{subtitle}</p>
                        ) : null}
                      </div>
                      {value != null ? (
                        <div className='w-[5.5rem] shrink-0 text-end'>
                          <p
                            className={cn(
                              'truncate text-sm font-semibold tabular-nums',
                              mobileItem.valueClassName?.(row.original)
                            )}
                          >
                            {value}
                          </p>
                          {valueLabel ? (
                            <p className='text-muted-foreground truncate text-[10px]'>
                              {valueLabel}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

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
