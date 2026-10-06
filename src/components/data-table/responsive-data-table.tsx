'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { type Row, type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { t } from '@/i18n';
import { useContainerMode } from './use-container-mode';
import { isColumnVisibleInMode } from './column-visibility';
import { DataTableToolbar } from './data-table-toolbar';
import { DataTablePagination } from './data-table-pagination';
import { MobileList } from './mobile-list';
import { GroupedLedgerList } from './grouped-ledger-list';
import { LoadMore } from './load-more';
import { QuickFilterChips } from './quick-filter-chips';
import { RecordDetail } from './record-detail';
import { buildDetailFromTable, buildMobileItemFromTable } from './build-from-columns';
import type { DetailConfig, MobileItemConfig, QuickFilterChip } from './types';

export interface LedgerListConfig<TData> {
  getDateKey: (row: TData) => string;
}

interface ResponsiveDataTableProps<TData> {
  table: TanstackTable<TData>;
  toolbarAction?: React.ReactNode;
  /** Explicit slots; when omitted, auto-layout from column meta. */
  mobileItem?: MobileItemConfig<TData>;
  /** Explicit detail; when omitted, built from all columns. */
  detail?: DetailConfig<TData> | Partial<DetailConfig<TData>>;
  quickFilters?: QuickFilterChip[];
  /** Banking-style date-grouped list on phones. */
  ledger?: LedgerListConfig<TData>;
  className?: string;
}

/**
 * One engine for all tables: list / compact / full by container width.
 * Auto-layout from column `meta.type` / `primary` / `highlight` when
 * `mobileItem` is omitted.
 */
export function ResponsiveDataTable<TData>({
  table,
  toolbarAction,
  mobileItem: mobileItemProp,
  detail: detailProp,
  quickFilters,
  ledger,
  className
}: ResponsiveDataTableProps<TData>) {
  const router = useRouter();
  const { ref, mode, wideCompact, measured } = useContainerMode();
  const [sideRow, setSideRow] = React.useState<Row<TData> | null>(null);
  const isList = mode === 'list' || mode === 'cards';

  const mobileItem = React.useMemo(
    () => mobileItemProp ?? buildMobileItemFromTable(table),
    // table identity changes with data; rebuild when column defs / rows change
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
    [mobileItemProp, table.options.columns, table.options.data]
  );

  const detail = React.useMemo(() => {
    if (
      detailProp &&
      'title' in detailProp &&
      typeof detailProp.title === 'function' &&
      detailProp.sections
    ) {
      return detailProp as DetailConfig<TData>;
    }
    return buildDetailFromTable(table, detailProp);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [detailProp, table.options.columns, table.options.data]);

  return (
    <div
      ref={ref}
      data-slot='responsive-data-table'
      className={cn(
        // Fill TablePageBody / PageContainer(fill); rows scroll in the inner pane.
        'flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden',
        className
      )}
    >
      {!measured ? (
        <div className='flex flex-col gap-2' aria-busy='true'>
          <Skeleton className='h-11 w-full' />
          <Skeleton className='h-40 w-full rounded-[var(--radius)]' />
          <Skeleton className='h-10 w-full' />
        </div>
      ) : (
        <>
          <DataTableToolbar table={table} mode={isList ? 'list' : mode}>
            {!isList ? toolbarAction : null}
          </DataTableToolbar>

          {isList && quickFilters?.length ? (
            <div className='shrink-0'>
              <QuickFilterChips table={table} chips={quickFilters} />
            </div>
          ) : null}

          <div className='min-h-0 flex-1 overflow-y-auto overscroll-y-contain'>
            {isList ? (
              <>
                {ledger ? (
                  <GroupedLedgerList
                    table={table}
                    getDateKey={ledger.getDateKey}
                    mobileItem={mobileItem}
                    detail={detail}
                    onNavigate={(href) => router.push(href)}
                  />
                ) : (
                  <MobileList
                    table={table}
                    mobileItem={mobileItem}
                    detail={detail}
                    onNavigate={(href) => router.push(href)}
                  />
                )}
                <LoadMore table={table} />
              </>
            ) : (
              <>
                <CompactOrFullTable
                  table={table}
                  mode={mode === 'full' ? 'full' : 'compact'}
                  wideCompact={wideCompact}
                  onRowClick={(row) => setSideRow(row)}
                />
                <DataTablePagination table={table} variant='full' />
              </>
            )}
          </div>

          <RecordDetail
            open={sideRow != null}
            onOpenChange={(open) => {
              if (!open) setSideRow(null);
            }}
            presentation={isList ? 'sheet' : 'side'}
            data={sideRow?.original ?? null}
            detail={{
              ...detail,
              actions: (row) => {
                const base = detail.actions?.(row) ?? [];
                if (detail.mode === 'page' && detail.href) {
                  return [
                    {
                      label: t('table.openRecord'),
                      onClick: () => router.push(detail.href!(row))
                    },
                    ...base
                  ];
                }
                return base;
              }
            }}
          />
        </>
      )}
    </div>
  );
}

function CompactOrFullTable<TData>({
  table,
  mode,
  wideCompact,
  onRowClick
}: {
  table: TanstackTable<TData>;
  mode: 'compact' | 'full';
  wideCompact: boolean;
  onRowClick?: (row: Row<TData>) => void;
}) {
  const stickyFirst = mode === 'compact';

  return (
    <div className='relative min-w-0 overflow-x-auto rounded-lg border border-border'>
      <Table className='min-w-full'>
        <TableHeader className='bg-background sticky top-0 z-10'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className='hover:bg-transparent'>
              {headerGroup.headers.map((header, index) => {
                if (!isColumnVisibleInMode(header.column, mode, wideCompact)) {
                  return null;
                }
                const isActions = header.column.id === 'actions';
                const isSticky = stickyFirst && index === 0 && !isActions;
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'bg-background',
                      isActions && 'w-12 text-end',
                      isSticky && 'sticky start-0 z-20 shadow-[1px_0_0_0_var(--border)]'
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={onRowClick ? 'cursor-pointer' : undefined}
                onClick={
                  onRowClick
                    ? (e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('[data-slot="dropdown-menu-trigger"],button,a')) {
                          return;
                        }
                        onRowClick(row);
                      }
                    : undefined
                }
              >
                {row.getVisibleCells().map((cell, index) => {
                  if (!isColumnVisibleInMode(cell.column, mode, wideCompact)) {
                    return null;
                  }
                  const isActions = cell.column.id === 'actions';
                  const isSticky = stickyFirst && index === 0 && !isActions;
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        isActions && 'w-12 text-end',
                        isSticky &&
                          'bg-background sticky start-0 z-10 shadow-[1px_0_0_0_var(--border)]'
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className='h-24 text-center'>
                {t('table.noResults')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
