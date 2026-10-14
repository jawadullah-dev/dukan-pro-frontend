'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { parseAsString, useQueryState } from 'nuqs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
import { formatLabel, formatPkr } from '@/lib/dukaan/numbers';
import type { PurchaseDTO } from '@/lib/api/types';
import type { PurchaseRowActionsProps, PurchasesTableProps } from '@/types/purchases';
import { purchasesQueryOptions } from '../api/queries';
import type { PurchasesListFilters } from '@/types';
import { CancelPurchaseDialog } from './cancel-purchase-dialog';

function PurchaseRowActions({ purchase }: PurchaseRowActionsProps) {
  const t = useT();
  const [cancelOpen, setCancelOpen] = useState(false);
  const isCancelled = purchase.status === 'CANCELLED';

  if (isCancelled) {
    return null;
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role='presentation'
      data-slot='action-cell'
    >
      {cancelOpen && (
        <CancelPurchaseDialog purchase={purchase} open={cancelOpen} onOpenChange={setCancelOpen} />
      )}

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
          <span className='sr-only'>{t('common.openMenu')}</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-36'>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className='text-destructive focus:text-destructive'
              onClick={(e) => {
                e.stopPropagation();
                requestAnimationFrame(() => setCancelOpen(true));
              }}
            >
              <Icons.close className='me-2 h-4 w-4' />
              {t('common.cancel')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Cancelled', value: 'CANCELLED' }
];

const purchaseMobileItem: MobileItemConfig<PurchaseDTO> = {
  leading: 'icon',
  leadingIcon: Icons.receipt,
  title: (row) => row.purchaseNo,
  subtitle: (row) => row.supplierInvoiceRef || row.supplierName || '—',
  badge: (row) => ({ label: formatLabel(row.status), status: row.status }),
  value: (row) => formatPkr(row.totalAmount),
  meta: [(row) => (row.purchaseDate ? row.purchaseDate.split('T')[0] : '—')],
  ariaLabel: (row) => `${row.purchaseNo}, ${row.supplierName ?? ''}, ${formatPkr(row.totalAmount)}`
};

const purchaseDetail: DetailConfig<PurchaseDTO> = {
  mode: 'sheet',
  title: (row) => row.purchaseNo,
  badge: (row) => ({ label: formatLabel(row.status), status: row.status }),
  value: (row) => formatPkr(row.totalAmount),
  sections: (row) => [
    {
      title: 'Purchase Information',
      fields: [
        { label: 'Purchase #', value: row.purchaseNo },
        { label: 'Date', value: row.purchaseDate ? row.purchaseDate.split('T')[0] : '—' },
        { label: 'Supplier', value: row.supplierName ?? '—' },
        { label: 'Supplier Invoice', value: row.supplierInvoiceRef ?? '—' },
        { label: 'Total Amount', value: formatPkr(row.totalAmount) },
        { label: 'Status', value: <StatusBadge status={row.status} /> },
        ...(row.isOpeningStock
          ? [
              {
                label: 'Type',
                value: 'Opening Stock'
              }
            ]
          : [])
      ]
    }
  ]
};

export function PurchasesTable({ toolbarAction }: PurchasesTableProps) {
  const t = useT();
  const sortableColumnIds = [
    'purchaseDate',
    'purchaseNo',
    'totalAmount',
    'status',
    'createdAt',
    'updatedAt'
  ];
  const { params, filters } = useDukaanListParams(sortableColumnIds, 'purchaseDate', ['status']);

  const [purchaseNoParam] = useQueryState('purchaseNo', parseAsString);
  const [searchParam] = useQueryState('search', parseAsString);
  const [statusParam] = useQueryState('status', parseAsString);

  const search = searchParam || purchaseNoParam || undefined;

  let statusFilter: 'ACTIVE' | 'CANCELLED' | undefined;
  const rawStatus = (filters as Record<string, unknown>).status ?? statusParam;
  if (rawStatus) {
    const statuses: string[] = Array.isArray(rawStatus)
      ? (rawStatus as string[])
      : typeof rawStatus === 'string'
        ? rawStatus.split(',')
        : [];
    if (statuses.includes('ACTIVE') && !statuses.includes('CANCELLED')) {
      statusFilter = 'ACTIVE';
    } else if (statuses.includes('CANCELLED') && !statuses.includes('ACTIVE')) {
      statusFilter = 'CANCELLED';
    }
  }

  const sortItem = params.sort[0];
  let sortBy: PurchasesListFilters['sortBy'] = 'purchaseDate';
  let sortOrder: 'asc' | 'desc' = 'desc';

  if (sortItem && sortableColumnIds.includes(sortItem.id)) {
    sortBy = sortItem.id as PurchasesListFilters['sortBy'];
    sortOrder = sortItem.desc ? 'desc' : 'asc';
  }

  const { data } = useQuery(
    purchasesQueryOptions({
      page: params.page,
      pageSize: params.perPage,
      search: search || undefined,
      status: statusFilter,
      sortBy,
      sortOrder
    })
  );

  let items = data?.items ?? [];
  if (sortBy === 'status' && items.length > 1) {
    items = [...items].sort((a, b) => {
      const sA = (a.status || '').toLowerCase();
      const sB = (b.status || '').toLowerCase();
      return sortOrder === 'desc' ? sB.localeCompare(sA) : sA.localeCompare(sB);
    });
  }
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / params.perPage));

  const columns: ColumnDef<PurchaseDTO>[] = [
    {
      id: 'purchaseNo',
      accessorKey: 'purchaseNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('purchases.purchaseNoCol')} />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-1.5 font-normal text-foreground'>
          <span>{row.original.purchaseNo}</span>
          {row.original.isOpeningStock && (
            <Badge
              variant='outline'
              className='border-blue-500/40 text-[10px] text-blue-600 dark:text-blue-400'
            >
              {t('purchases.openingBadge')}
            </Badge>
          )}
        </div>
      ),
      meta: {
        label: 'table.col.no',
        placeholderKey: 'search.purchases',
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
      id: 'purchaseDate',
      accessorKey: 'purchaseDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.date')} />,
      cell: ({ row }) => {
        const dateVal = row.original.purchaseDate;
        const formatted = dateVal ? dateVal.split('T')[0] : '—';
        return <span className='font-normal text-foreground'>{formatted}</span>;
      },
      meta: {
        label: 'table.col.date',
        variant: 'date',
        priority: 2,
        mobile: 'meta'
      },
      enableColumnFilter: false,
      enableSorting: true
    },
    {
      id: 'supplierName',
      accessorKey: 'supplierName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.supplier')} />
      ),
      cell: ({ row }) => (
        <span className='font-normal text-foreground'>{row.original.supplierName || '—'}</span>
      ),
      meta: {
        label: 'table.col.supplier',
        variant: 'text',
        priority: 2,
        mobile: 'subtitle'
      },
      enableColumnFilter: false,
      enableSorting: false
    },
    {
      id: 'supplierInvoiceRef',
      accessorKey: 'supplierInvoiceRef',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.supplierInvoice')} />
      ),
      cell: ({ row }) => (
        <span className='font-normal text-foreground'>
          {row.original.supplierInvoiceRef || '—'}
        </span>
      ),
      meta: {
        label: 'table.col.supplierInvoice',
        variant: 'text',
        priority: 3,
        mobile: 'hidden'
      },
      enableColumnFilter: false,
      enableSorting: false
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
        priority: 1,
        mobile: 'value'
      },
      enableColumnFilter: false,
      enableSorting: true
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.status')} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      meta: {
        label: 'table.col.status',
        variant: 'select',
        options: STATUS_OPTIONS,
        priority: 1,
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
      cell: ({ row }) => <PurchaseRowActions purchase={row.original} />
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

  const purchaseQuickFilters: QuickFilterChip[] = [
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
      mobileItem={purchaseMobileItem}
      detail={purchaseDetail}
      quickFilters={purchaseQuickFilters}
    />
  );
}
