'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface DataTableSkeletonProps extends React.ComponentProps<'div'> {
  columnCount?: number;
  rowCount?: number;
  filterCount?: number;
  cellWidths?: string[];
  withViewOptions?: boolean;
  withPagination?: boolean;
  shrinkZero?: boolean;
  mode?: 'auto' | 'list' | 'cards' | 'compact' | 'full';
}

export function DataTableSkeleton({
  columnCount = 4,
  rowCount = 3,
  filterCount = 0,
  cellWidths = ['auto'],
  withViewOptions = true,
  withPagination = true,
  shrinkZero = false,
  mode = 'auto',
  className,
  ...props
}: DataTableSkeletonProps) {
  const cozyCellWidths = Array.from(
    { length: columnCount },
    (_, index) => cellWidths[index % cellWidths.length] ?? 'auto'
  );

  const showList = mode === 'list' || mode === 'cards' || mode === 'auto';
  const showCompact = mode === 'compact' || mode === 'auto';
  const showFull = mode === 'full' || mode === 'auto';

  return (
    <div
      data-slot='data-table-skeleton'
      className={cn('flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3', className)}
      aria-busy='true'
      aria-label='Loading table data'
      {...props}
    >
      {/* =========================================================================
          1. MOBILE VIEW SKELETON (Phone screens < 640px)
          Card list layout matching MobileListItem
         ========================================================================= */}
      {showList ? (
        <div
          data-slot='mobile-skeleton'
          className={cn(
            'flex min-h-0 flex-1 flex-col gap-3',
            mode === 'auto' ? 'block sm:hidden' : 'block'
          )}
        >
          {/* Mobile Toolbar */}
          <div className='flex items-center gap-2'>
            <Skeleton className='h-10 flex-1 rounded-md' />
            <Skeleton className='size-10 shrink-0 rounded-md' />
          </div>

          {/* Mobile List Items */}
          <div className='divide-border overflow-hidden rounded-lg border border-border bg-card divide-y'>
            {Array.from({ length: rowCount }).map((_, i) => (
              <div key={i} className='flex min-h-16 items-center justify-between gap-3 px-3 py-3'>
                <div className='flex min-w-0 flex-1 items-center gap-3'>
                  <Skeleton className='size-10 shrink-0 rounded-md bg-muted/70' />
                  <div className='flex min-w-0 flex-1 flex-col gap-2'>
                    <Skeleton
                      className='h-4 rounded bg-muted/80'
                      style={{ width: `${Math.min(180, 100 + ((i * 17) % 80))}px` }}
                    />
                    <Skeleton className='h-3 w-16 rounded bg-muted/50' />
                  </div>
                </div>
                <Skeleton className='h-5 w-14 shrink-0 rounded-full bg-muted/60' />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* =========================================================================
          2. TABLET / IPAD VIEW SKELETON (Small iPad / Tablet 640px - 1023px)
          Compact table layout with fewer columns and compact pagination
         ========================================================================= */}
      {showCompact ? (
        <div
          data-slot='tablet-skeleton'
          className={cn(
            'min-h-0 flex-1 flex-col gap-3',
            mode === 'auto' ? 'hidden sm:flex lg:hidden' : 'flex'
          )}
        >
          {/* Tablet Toolbar */}
          <div className='flex items-center justify-between gap-2'>
            <Skeleton className='h-10 w-64 rounded-md' />
            <div className='flex items-center gap-2'>
              <Skeleton className='h-9 w-20 rounded-md' />
              <Skeleton className='h-9 w-28 rounded-md' />
            </div>
          </div>

          {/* Compact Table */}
          <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card'>
            <Table containerClassName='min-h-0 flex-1 overflow-hidden'>
              <TableHeader className='sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]'>
                <TableRow className='hover:bg-transparent'>
                  <TableHead className='w-[45%]'>
                    <Skeleton className='h-4 w-24' />
                  </TableHead>
                  <TableHead className='w-[40%]'>
                    <Skeleton className='h-4 w-20' />
                  </TableHead>
                  <TableHead className='w-12 text-end'>
                    <Skeleton className='ms-auto size-4 rounded' />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: rowCount }).map((_, i) => (
                  <TableRow key={i} className='hover:bg-transparent'>
                    <TableCell>
                      <Skeleton
                        className='h-4 rounded'
                        style={{ width: `${Math.min(200, 120 + ((i * 23) % 80))}px` }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-16 rounded-full bg-muted/60' />
                    </TableCell>
                    <TableCell className='text-end'>
                      <Skeleton className='ms-auto size-7 rounded-md' />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Tablet Pagination */}
          {withPagination ? (
            <div className='flex items-center justify-between px-1 py-1'>
              <Skeleton className='h-4 w-28' />
              <div className='flex items-center gap-1.5'>
                <Skeleton className='size-8 rounded-md' />
                <Skeleton className='size-8 rounded-md' />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* =========================================================================
          3. LARGE SCREEN / DESKTOP VIEW SKELETON (>= 1024px)
          Full multi-column table with full toolbar and pagination controls
         ========================================================================= */}
      {showFull ? (
        <div
          data-slot='desktop-skeleton'
          className={cn(
            'min-h-0 flex-1 flex-col gap-3',
            mode === 'auto' ? 'hidden lg:flex' : 'flex'
          )}
        >
          {/* Desktop Toolbar */}
          <div className='flex items-center justify-between gap-4'>
            <div className='flex flex-1 items-center gap-2'>
              <Skeleton className='h-10 w-72 rounded-md' />
              {filterCount > 0
                ? Array.from({ length: filterCount }).map((_, i) => (
                    <Skeleton key={i} className='h-10 w-28 rounded-md border-dashed' />
                  ))
                : null}
            </div>
            <div className='flex items-center gap-2'>
              {withViewOptions ? <Skeleton className='h-9 w-20 rounded-md' /> : null}
              <Skeleton className='h-9 w-28 rounded-md' />
            </div>
          </div>

          {/* Full Desktop Table */}
          <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card'>
            <Table containerClassName='min-h-0 flex-1 overflow-hidden'>
              <TableHeader className='sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]'>
                <TableRow className='hover:bg-transparent'>
                  {Array.from({ length: columnCount }).map((_, j) => (
                    <TableHead
                      key={j}
                      style={{
                        width: cozyCellWidths[j],
                        minWidth: shrinkZero ? cozyCellWidths[j] : 'auto'
                      }}
                    >
                      <Skeleton className='h-4 w-24' />
                    </TableHead>
                  ))}
                  <TableHead className='w-12 text-end'>
                    <Skeleton className='ms-auto size-4 rounded' />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: rowCount }).map((_, i) => (
                  <TableRow key={i} className='hover:bg-transparent'>
                    {Array.from({ length: columnCount }).map((_, j) => (
                      <TableCell
                        key={j}
                        style={{
                          width: cozyCellWidths[j],
                          minWidth: shrinkZero ? cozyCellWidths[j] : 'auto'
                        }}
                      >
                        {j === 1 ? (
                          <Skeleton className='h-5 w-16 rounded-full bg-muted/60' />
                        ) : (
                          <Skeleton
                            className='h-4'
                            style={{
                              width: j === 0 ? `${Math.min(180, 110 + ((i * 19) % 70))}px` : '60%'
                            }}
                          />
                        )}
                      </TableCell>
                    ))}
                    <TableCell className='text-end'>
                      <Skeleton className='ms-auto size-7 rounded-md' />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Full Desktop Pagination */}
          {withPagination ? (
            <div className='flex items-center justify-between px-1 py-1'>
              <Skeleton className='h-4 w-40' />
              <div className='flex items-center gap-6'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-8 w-16 rounded-md' />
                </div>
                <Skeleton className='h-4 w-24' />
                <div className='flex items-center gap-1.5'>
                  <Skeleton className='size-8 rounded-md' />
                  <Skeleton className='size-8 rounded-md' />
                  <Skeleton className='size-8 rounded-md' />
                  <Skeleton className='size-8 rounded-md' />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
