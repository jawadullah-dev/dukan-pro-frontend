'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { parseAsString, useQueryState } from 'nuqs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  ResponsiveDataTable,
  StatusBadge,
  type DetailConfig,
  type MobileItemConfig,
  type QuickFilterChip
} from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useDataTable } from '@/hooks/use-data-table';
import { Icons } from '@/components/icons';
import { useT } from '@/i18n/use-t';
import { DUKAAN_DEFAULT_PAGE_SIZE, useDukaanListParams } from '@/components/data-table/list-params';
import { formatPkr } from '@/lib/dukaan/numbers';
import type { SaleDTO } from '@/lib/api/types';
import type { SaleRowActionsProps, SalesTableProps } from '@/types/sales';
import { salesQueryOptions } from '../api/queries';
import type { SalesListFilters } from '@/types';
import { CancelSaleDialog } from './cancel-sale-dialog';
import { ReturnSaleDialog } from './return-sale-dialog';

function SaleRowActions({ sale }: SaleRowActionsProps) {
  const router = useRouter();
  const t = useT();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  const hasReturns = (sale.returns?.length ?? 0) > 0;
  const isCancelled = sale.status === 'CANCELLED';

  return (
    <div onClick={(e) => e.stopPropagation()} data-slot='action-cell'>
      {cancelOpen && (
        <CancelSaleDialog sale={sale} open={cancelOpen} onOpenChange={setCancelOpen} />
      )}
      {returnOpen && (
        <ReturnSaleDialog sale={sale} open={returnOpen} onOpenChange={setReturnOpen} />
      )}

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
          <span className='sr-only'>{t('common.openMenu')}</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-36'>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/sales/${sale.id}`);
              }}
            >
              <Icons.page className='me-2 h-4 w-4' />
              {t('common.view')}
            </DropdownMenuItem>

            {!isCancelled && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  requestAnimationFrame(() => setReturnOpen(true));
                }}
              >
                <Icons.history className='me-2 h-4 w-4 text-blue-500' />
                {t('sales.returnBadge')}
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          {!isCancelled && !hasReturns && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={(e) => {
                    e.stopPropagation();
                    requestAnimationFrame(() => setCancelOpen(true));
                  }}
                >
                  <Icons.trash className='me-2 h-4 w-4' />
                  {t('common.cancel')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const saleMobileItem: MobileItemConfig<SaleDTO> = {
  leading: 'icon',
  leadingIcon: Icons.receipt,
  title: (row) => row.saleNo,
  subtitle: (row) => row.customerName ?? 'Walk-in',
  badge: (row) => ({
    label: row.status === 'CANCELLED' ? 'Cancelled' : 'Active',
    status: row.status
  }),
  value: (row) => formatPkr(row.totalAmount),
  meta: [(row: SaleDTO) => (row.saleDate ? row.saleDate.split('T')[0] : '—')],
  ariaLabel: (row: SaleDTO) =>
    `${row.saleNo}, ${row.customerName ?? 'Walk-in'}, ${formatPkr(row.totalAmount)}`
};

const saleDetail: DetailConfig<SaleDTO> = {
  mode: 'sheet',
  title: (row) => row.saleNo,
  badge: (row) => ({
    label: row.status === 'CANCELLED' ? 'Cancelled' : 'Active',
    status: row.status
  }),
  value: (row) => formatPkr(row.totalAmount),
  sections: (row) => [
    {
      title: 'Sale Information',
      fields: [
        { label: 'Sale #', value: row.saleNo },
        { label: 'Sale Date', value: row.saleDate ? row.saleDate.split('T')[0] : '—' },
        { label: 'Customer', value: row.customerName ?? 'Walk-in' },
        { label: 'Total Amount', value: formatPkr(row.totalAmount) },
        {
          label: 'Paid',
          value: formatPkr(
            (row.payments ?? [])
              .filter((p) => p.status === 'ACTIVE')
              .reduce((acc, p) => acc + p.amount, 0)
          )
        },
        {
          label: 'Status',
          value: (
            <StatusBadge
              status={row.status}
              label={row.status === 'CANCELLED' ? 'Cancelled' : 'Active'}
            />
          )
        }
      ]
    },
    ...(row.status === 'CANCELLED' && row.cancelledAt
      ? [
          {
            title: 'Cancellation Details',
            fields: [
              { label: 'Reason', value: row.cancelReason || '—' },
              {
                label: 'Cancelled At',
                value: row.cancelledAt ? row.cancelledAt.split('T')[0] : '—'
              }
            ]
          }
        ]
      : [])
  ]
};

export function SalesTable({ toolbarAction }: SalesTableProps) {
  const t = useT();

  const sortableColumnIds = [
    'saleDate',
    'saleNo',
    'totalAmount',
    'paid',
    'status',
    'createdAt',
    'updatedAt'
  ];
  const { params } = useDukaanListParams(sortableColumnIds, 'saleDate', ['status']);

  const [saleNoParam] = useQueryState('saleNo', parseAsString);
  const [searchParam] = useQueryState('search', parseAsString);
  const [statusParam] = useQueryState('status', parseAsString);

  const search = searchParam || saleNoParam || undefined;

  let statusFilter: 'ACTIVE' | 'CANCELLED' | undefined;
  if (statusParam) {
    const statuses = Array.isArray(statusParam)
      ? (statusParam as string[])
      : typeof statusParam === 'string'
        ? statusParam.split(',')
        : [];
    if (statuses.includes('ACTIVE') && !statuses.includes('CANCELLED')) {
      statusFilter = 'ACTIVE';
    } else if (statuses.includes('CANCELLED') && !statuses.includes('ACTIVE')) {
      statusFilter = 'CANCELLED';
    }
  }

  const sortItem = params.sort[0];
  let sortBy: SalesListFilters['sortBy'] = 'createdAt';
  let sortOrder: 'asc' | 'desc' = 'desc';

  if (sortItem && sortableColumnIds.includes(sortItem.id)) {
    sortBy = sortItem.id as SalesListFilters['sortBy'];
    sortOrder = sortItem.desc ? 'desc' : 'asc';
  }

  const { data, isLoading, isFetching } = useQuery(
    salesQueryOptions({
      page: params.page,
      pageSize: params.perPage,
      search: search || undefined,
      status: statusFilter,
      sortBy,
      sortOrder
    })
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / params.perPage));

  const columns: ColumnDef<SaleDTO>[] = [
    {
      id: 'saleNo',
      accessorKey: 'saleNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('sales.saleNoCol')} />
      ),
      cell: ({ row }) => {
        const hasReturns = (row.original.returns?.length ?? 0) > 0;
        return (
          <div className='flex items-center gap-1.5 font-normal text-foreground'>
            <span>{row.original.saleNo}</span>
            {hasReturns && (
              <Badge
                variant='outline'
                className='border-amber-500/40 text-[10px] text-amber-600 dark:text-amber-400'
              >
                {t('sales.returnBadge')}
              </Badge>
            )}
          </div>
        );
      },
      meta: {
        label: 'table.col.no',
        placeholderKey: 'search.sales',
        variant: 'text',
        icon: Icons.search,
        type: 'text',
        primary: true,
        priority: 1,
        mobile: 'title'
      },
      enableColumnFilter: true,
      enableSorting: true
    },
    {
      id: 'customerName',
      accessorKey: 'customerName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.customer')} />
      ),
      cell: ({ row }) => (
        <span className='font-normal text-foreground'>
          {row.original.customerName || (
            <span className='text-muted-foreground italic'>{t('sales.walkInBadge')}</span>
          )}
        </span>
      ),
      meta: {
        label: 'table.col.customer',
        variant: 'text',
        priority: 2,
        mobile: 'subtitle'
      },
      enableColumnFilter: false,
      enableSorting: false
    },
    {
      id: 'saleDate',
      accessorKey: 'saleDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.date')} />,
      cell: ({ row }) => {
        const dateVal = row.original.saleDate;
        const formatted = dateVal ? dateVal.split('T')[0] : '—';
        return <span className='font-normal text-foreground'>{formatted}</span>;
      },
      meta: {
        label: 'table.col.date',
        variant: 'date',
        priority: 4,
        mobile: 'meta'
      },
      enableColumnFilter: false,
      enableSorting: true
    },
    {
      id: 'totalAmount',
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.total')} />
      ),
      cell: ({ row }) => (
        <span className='font-normal text-foreground'>{formatPkr(row.original.totalAmount)}</span>
      ),
      meta: {
        label: 'table.col.total',
        variant: 'number',
        priority: 3,
        mobile: 'value'
      },
      enableColumnFilter: false,
      enableSorting: true
    },
    {
      id: 'paid',
      accessorFn: (row) => {
        const activePayments = (row.payments ?? []).filter((p) => p.status === 'ACTIVE');
        return activePayments.reduce((acc, p) => acc + p.amount, 0);
      },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.paid')} />,
      cell: ({ row }) => {
        const activePayments = (row.original.payments ?? []).filter((p) => p.status === 'ACTIVE');
        const paid = activePayments.reduce((acc, p) => acc + p.amount, 0);

        return <span className='font-normal text-foreground'>{formatPkr(paid)}</span>;
      },
      meta: {
        label: 'table.col.paid',
        variant: 'number',
        priority: 3
      },
      enableSorting: true
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.status')} />
      ),
      cell: ({ row }) => {
        const isCancelled = row.original.status === 'CANCELLED';
        return (
          <StatusBadge
            status={row.original.status}
            label={isCancelled ? t('status.cancelled') : t('status.active')}
          />
        );
      },
      meta: {
        label: 'table.col.status',
        variant: 'select',
        options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Cancelled', value: 'CANCELLED' }
        ],
        priority: 3,
        mobile: 'badge'
      },
      enableColumnFilter: true,
      enableSorting: true
    },
    {
      id: 'actions',
      size: 48,
      enableSorting: false,
      enableHiding: false,
      meta: { mobile: 'hidden' },
      cell: ({ row }) => <SaleRowActions sale={row.original} />
    }
  ];

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount,
    rowCount: total,
    shallow: true,
    debounceMs: 400,
    initialState: {
      pagination: { pageIndex: 0, pageSize: DUKAAN_DEFAULT_PAGE_SIZE }
    }
  });

  const salesQuickFilters: QuickFilterChip[] = [
    { id: 'all', label: t('table.all') },
    {
      id: 'active',
      label: t('status.active'),
      columnId: 'status',
      value: ['ACTIVE']
    },
    {
      id: 'cancelled',
      label: t('status.cancelled'),
      columnId: 'status',
      value: ['CANCELLED']
    }
  ];

  return (
    <ResponsiveDataTable
      table={table}
      toolbarAction={toolbarAction}
      mobileItem={saleMobileItem}
      detail={saleDetail}
      quickFilters={salesQuickFilters}
      isLoading={isLoading || isFetching}
      rowCount={items.length > 0 ? items.length : total > 0 ? total : undefined}
    />
  );
}
