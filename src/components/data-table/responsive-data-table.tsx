'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { type Row, type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
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

const routeRowCountCache: Record<string, number> = {};

function getCachedTableRows(pathname: string): number | null {
  if (routeRowCountCache[pathname]) {
    return routeRowCountCache[pathname];
  }
  if (typeof window !== 'undefined') {
    try {
      const val = sessionStorage.getItem(`dukaan_table_rows_${pathname}`);
      if (val) {
        const parsed = parseInt(val, 10);
        if (parsed > 0) {
          routeRowCountCache[pathname] = parsed;
          return parsed;
        }
      }
    } catch {}
  }
  return null;
}

function setCachedTableRows(pathname: string, count: number) {
  if (!pathname || count <= 0) return;
  routeRowCountCache[pathname] = count;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(`dukaan_table_rows_${pathname}`, String(count));
    } catch {}
  }
}

export interface LedgerListConfig<TData> {
  getDateKey: (row: TData) => string;
}

interface ResponsiveDataTableProps<TData> {
  table: TanstackTable<TData>;
  toolbarAction?: React.ReactNode;

  mobileItem?: MobileItemConfig<TData>;

  detail?: DetailConfig<TData> | Partial<DetailConfig<TData>>;
  quickFilters?: QuickFilterChip[];

  ledger?: LedgerListConfig<TData>;
  className?: string;
  isLoading?: boolean;
  rowCount?: number;
}

export function ResponsiveDataTable<TData>({
  table,
  toolbarAction,
  mobileItem: mobileItemProp,
  detail: detailProp,
  quickFilters,
  ledger,
  className,
  isLoading = false,
  rowCount
}: ResponsiveDataTableProps<TData>) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { ref, mode, wideCompact, measured } = useContainerMode();
  const [sideRow, setSideRow] = React.useState<Row<TData> | null>(null);
  const isList = mode === 'list' || mode === 'cards';

  const mobileItem = React.useMemo(
    () =>
      mobileItemProp ?? buildMobileItemFromTable(table, (key) => (t as (k: string) => string)(key)),

    [mobileItemProp, table.options.columns, table.options.data, t]
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
    return buildDetailFromTable(table, detailProp, (key) => (t as (k: string) => string)(key));
  }, [detailProp, table.options.columns, table.options.data, t]);

  const currentRowsCount = table.getRowModel().rows.length || table.options.data?.length;

  React.useEffect(() => {
    if (currentRowsCount && currentRowsCount > 0 && pathname) {
      setCachedTableRows(pathname, currentRowsCount);
    }
  }, [pathname, currentRowsCount]);

  const [cachedRowsCount, setCachedRowsCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (pathname) {
      const cached = getCachedTableRows(pathname);
      if (cached) setCachedRowsCount(cached);
    }
  }, [pathname]);

  const skeletonRowCount =
    (currentRowsCount && currentRowsCount > 0 ? currentRowsCount : null) ??
    (rowCount && rowCount > 0 ? rowCount : null) ??
    (cachedRowsCount && cachedRowsCount > 0 ? cachedRowsCount : null) ??
    3;

  return (
    <div
      ref={ref}
      data-slot='responsive-data-table'
      className={cn('flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden', className)}
    >
      <DataTableToolbar table={table} mode={isList ? 'list' : mode}>
        {!isList ? toolbarAction : null}
      </DataTableToolbar>

      {isList && quickFilters?.length ? (
        <div className='shrink-0'>
          <QuickFilterChips table={table} chips={quickFilters} />
        </div>
      ) : null}

      {isList ? (
        <div className='min-h-0 flex-1 overflow-y-auto overscroll-y-contain'>
          <div className='p-px'>
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
                isLoading={isLoading}
                skeletonRowCount={skeletonRowCount}
                onNavigate={(href) => router.push(href)}
              />
            )}
            <LoadMore table={table} />
          </div>
        </div>
      ) : (
        <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-hidden'>
          <CompactOrFullTable
            table={table}
            mode={mode === 'full' ? 'full' : 'compact'}
            wideCompact={wideCompact}
            isLoading={isLoading}
            skeletonRowCount={skeletonRowCount}
            onRowClick={(row) => setSideRow(row)}
          />
          <div className='shrink-0'>
            <DataTablePagination table={table} variant='full' />
          </div>
        </div>
      )}

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
                  onClick: () => {
                    if (detail.href) router.push(detail.href(row));
                  }
                },
                ...base
              ];
            }
            return base;
          }
        }}
      />
    </div>
  );
}

interface CompactOrFullTableProps<TData> {
  table: TanstackTable<TData>;
  mode: 'compact' | 'full';
  wideCompact: boolean;
  isLoading?: boolean;
  skeletonRowCount?: number;
  onRowClick?: (row: Row<TData>) => void;
}

function CompactOrFullTable<TData>({
  table,
  mode,
  wideCompact,
  isLoading,
  skeletonRowCount,
  onRowClick
}: CompactOrFullTableProps<TData>) {
  const t = useTranslations();
  const stickyFirst = mode === 'compact';
  const currentCount = table.getRowModel().rows.length || table.options.data?.length;
  const effectiveSkeletonCount =
    (currentCount && currentCount > 0 ? currentCount : null) ?? skeletonRowCount ?? 3;

  return (
    <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card'>
      <Table
        className='min-w-full table-fixed'
        containerClassName='min-h-0 flex-1 overflow-auto overscroll-contain'
      >
        <TableHeader className='bg-background sticky top-0 z-20 shadow-[0_1px_0_0_var(--border)]'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className='hover:bg-transparent'>
              {headerGroup.headers.map((header, index) => {
                if (!isColumnVisibleInMode(header.column, mode, wideCompact)) {
                  return null;
                }
                const isActions = header.column.id === 'actions';
                const isSticky = stickyFirst && index === 0 && !isActions;
                const colSize = isActions
                  ? Math.max(header.column.columnDef.size ?? 0, 72)
                  : header.column.columnDef.size;
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: colSize ? `${colSize}px` : undefined }}
                    className={cn(
                      'bg-background sticky top-0 z-20 shadow-[0_1px_0_0_var(--border)]',
                      isActions && 'w-20 text-end pe-3',
                      isSticky && 'sticky start-0 z-30 shadow-[1px_1px_0_0_var(--border)]'
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext()) ||
                        (isActions ? (
                          <span className='h-8 inline-flex items-center text-xs font-medium text-foreground'>
                            {t('table.actions')}
                          </span>
                        ) : null)}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: effectiveSkeletonCount }).map((_, i) => (
              <TableRow key={i} className='hover:bg-transparent'>
                {table.getHeaderGroups()[0]?.headers.map((header, index) => {
                  if (!isColumnVisibleInMode(header.column, mode, wideCompact)) {
                    return null;
                  }
                  const isActions = header.column.id === 'actions';
                  const isSticky = stickyFirst && index === 0 && !isActions;
                  const colSize = isActions
                    ? Math.max(header.column.columnDef.size ?? 0, 72)
                    : header.column.columnDef.size;
                  return (
                    <TableCell
                      key={header.id}
                      style={{ width: colSize ? `${colSize}px` : undefined }}
                      className={cn(
                        isActions && 'w-20 text-end pe-3',
                        isSticky &&
                          'bg-background sticky start-0 z-10 shadow-[1px_0_0_0_var(--border)]'
                      )}
                    >
                      {isActions ? (
                        <Skeleton className='ms-auto size-6 rounded' />
                      ) : (
                        <Skeleton className='h-4 w-3/4 max-w-[120px]' />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={onRowClick ? 'cursor-pointer' : undefined}
                onClick={
                  onRowClick
                    ? (e) => {
                        const target = e.target as HTMLElement;
                        if (
                          target.closest(
                            '[data-slot="dropdown-menu-trigger"], [data-slot="dropdown-menu-content"], [data-slot="dropdown-menu-item"], [data-slot="action-cell"], [role="menuitem"], [role="menu"], button, a'
                          )
                        ) {
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
                  const colSize = isActions
                    ? Math.max(cell.column.columnDef.size ?? 0, 72)
                    : cell.column.columnDef.size;
                  return (
                    <TableCell
                      key={cell.id}
                      style={{ width: colSize ? `${colSize}px` : undefined }}
                      data-slot={isActions ? 'action-cell' : undefined}
                      onClick={isActions ? (e) => e.stopPropagation() : undefined}
                      className={cn(
                        isActions && 'w-20 text-end pe-3',
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
