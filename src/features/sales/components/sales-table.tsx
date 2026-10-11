'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryState, parseAsString } from 'nuqs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { salesQueryOptions } from '../api/queries';
import type { SalesListFilters } from '../api/service';
import { CancelSaleDialog } from './cancel-sale-dialog';
import { ReturnSaleDialog } from './return-sale-dialog';

// ---------------------------------------------------------------------------
// Action Menu for each sale row
// ---------------------------------------------------------------------------

interface SaleRowActionsProps {
  sale: SaleDTO;
}

function SaleRowActions({ sale }: SaleRowActionsProps) {
  const router = useRouter();
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
          <span className='sr-only'>Open menu</span>
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
              View
            </DropdownMenuItem>

            {!isCancelled && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  requestAnimationFrame(() => setReturnOpen(true));
                }}
              >
                <Icons.history className='me-2 h-4 w-4 text-blue-500' />
                Return
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
                  Cancel
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table Columns Definition
// ---------------------------------------------------------------------------

const salesColumns: ColumnDef<SaleDTO>[] = [
  {
    id: 'saleNo',
    accessorKey: 'saleNo',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Sale #' />,
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
              Return
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
    header: ({ column }) => <DataTableColumnHeader column={column} title='Customer' />,
    cell: ({ row }) => (
      <span className='font-normal text-foreground'>
        {row.original.customerName || <span className='text-muted-foreground italic'>Walk-in</span>}
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
    header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
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
    header: ({ column }) => <DataTableColumnHeader column={column} title='Total' />,
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
    header: ({ column }) => <DataTableColumnHeader column={column} title='Paid' />,
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
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => {
      const isCancelled = row.original.status === 'CANCELLED';
      return (
        <StatusBadge status={row.original.status} label={isCancelled ? 'Cancelled' : 'Active'} />
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
    size: 72,
    header: () => {
      const t = useT();
      return (
        <span className='h-8 inline-flex items-center text-xs font-medium text-foreground'>
          {t('table.actions')}
        </span>
      );
    },
    cell: ({ row }) => <SaleRowActions sale={row.original} />,
    enableSorting: false
  }
];

// ---------------------------------------------------------------------------
// Mobile card configuration
// ---------------------------------------------------------------------------

const saleMobileItem: MobileItemConfig<SaleDTO> = {
  title: (row: SaleDTO) => row.saleNo,
  subtitle: (row: SaleDTO) => row.customerName || 'Walk-in',
  value: (row: SaleDTO) => formatPkr(row.totalAmount),
  badge: (row: SaleDTO) => ({
    label: row.status === 'ACTIVE' ? 'Active' : 'Cancelled',
    tone: row.status === 'ACTIVE' ? 'success' : 'danger'
  }),
  meta: [(row: SaleDTO) => (row.saleDate ? row.saleDate.split('T')[0] : '—')]
};

// ---------------------------------------------------------------------------
// Drawer Detail configuration
// ---------------------------------------------------------------------------

const saleDetail: DetailConfig<SaleDTO> = {
  mode: 'sheet',
  title: (row: SaleDTO) => `Sale ${row.saleNo}`,
  badge: (row: SaleDTO) => ({
    label: row.status,
    tone: row.status === 'ACTIVE' ? 'success' : 'danger'
  }),
  sections: (row: SaleDTO) => [
    {
      title: 'Financial Summary',
      fields: [
        { label: 'Total Amount', value: formatPkr(row.totalAmount) },
        { label: 'Subtotal', value: formatPkr(row.subtotal) },
        { label: 'Discount', value: formatPkr(row.discount) },
        { label: 'Sale Date', value: row.saleDate ? row.saleDate.split('T')[0] : '—' },
        ...(row.dueDate ? [{ label: 'Due Date', value: row.dueDate }] : []),
        ...(row.notes ? [{ label: 'Notes', value: row.notes }] : [])
      ]
    },
    {
      title: `Items (${row.items?.length ?? 0})`,
      fields: (row.items ?? []).map((item) => ({
        label: `${item.productName} (x${item.quantity})`,
        value: `${formatPkr(item.total)}${item.imei ? ` · IMEI: ${item.imei}` : ''}`
      }))
    },
    ...(row.status === 'CANCELLED'
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

// ---------------------------------------------------------------------------
// SalesTable Component
// ---------------------------------------------------------------------------

interface SalesTableProps {
  toolbarAction?: ReactNode;
}

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
    const statuses = statusParam.split(',');
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

  const { table } = useDataTable({
    data: items,
    columns: salesColumns,
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
      label: 'Active',
      columnId: 'status',
      value: ['ACTIVE']
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
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
