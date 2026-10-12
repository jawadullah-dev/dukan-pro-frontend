'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { parseAsString, useQueryState } from 'nuqs';
import { useT } from '@/i18n/use-t';
import { Icons } from '@/components/icons';
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
  type MobileItemConfig
} from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useDataTable } from '@/hooks/use-data-table';
import { useDukaanListParams } from '@/components/data-table/list-params';
import { formatPkr } from '@/lib/dukaan/numbers';
import type { SupplierPaymentDTO, SupplierPaymentQueryFilter } from '@/types/supplier-payment';
import { useState, type ReactNode } from 'react';
import { supplierPaymentsQueryOptions } from '../api/queries';
import { CancelSupplierPaymentDialog } from './cancel-supplier-payment-dialog';
import { RecordSupplierPaymentDialog } from './record-supplier-payment-dialog';
import { SupplierPaymentDetailSheet } from './supplier-payment-detail-sheet';

// ---------------------------------------------------------------------------
// Row Actions
// ---------------------------------------------------------------------------

interface SupplierPaymentRowActionsProps {
  payment: SupplierPaymentDTO;
  onCancel: (payment: SupplierPaymentDTO) => void;
}

function SupplierPaymentRowActions({ payment, onCancel }: SupplierPaymentRowActionsProps) {
  const isCancelled = payment.status === 'CANCELLED';

  if (isCancelled) return null;

  return (
    <div onClick={(e) => e.stopPropagation()} data-slot='action-cell'>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
          <span className='sr-only'>Open menu</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-32'>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className='text-destructive focus:text-destructive cursor-pointer'
              onClick={(e) => {
                e.stopPropagation();
                requestAnimationFrame(() => onCancel(payment));
              }}
            >
              <Icons.close className='me-2 h-4 w-4' />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile Item Configuration
// ---------------------------------------------------------------------------

const supplierPaymentMobileItem: MobileItemConfig<SupplierPaymentDTO> = {
  title: (row: SupplierPaymentDTO) => row.supplierName || 'Supplier',
  subtitle: (row: SupplierPaymentDTO) =>
    row.purchaseNo ? `Bill #${row.purchaseNo}` : 'Opening Balance',
  value: (row: SupplierPaymentDTO) => formatPkr(row.amount),
  badge: (row: SupplierPaymentDTO) => ({
    label: row.status === 'ACTIVE' ? 'Active' : 'Cancelled',
    status: row.status
  }),
  meta: [(row: SupplierPaymentDTO) => (row.paymentDate ? row.paymentDate.split('T')[0] : '—')]
};

// ---------------------------------------------------------------------------
// Detail View Configuration
// ---------------------------------------------------------------------------

const supplierPaymentDetail: DetailConfig<SupplierPaymentDTO> = {
  mode: 'sheet',
  title: (row: SupplierPaymentDTO) => `Payment to ${row.supplierName || 'Supplier'}`,
  badge: (row: SupplierPaymentDTO) => ({
    label: row.status === 'ACTIVE' ? 'Active' : 'Cancelled',
    status: row.status
  }),
  value: (row: SupplierPaymentDTO) => formatPkr(row.amount),
  sections: (row: SupplierPaymentDTO) => [
    {
      title: 'Payment Details',
      fields: [
        { label: 'Date', value: row.paymentDate ? row.paymentDate.split('T')[0] : '—' },
        { label: 'Supplier', value: row.supplierName || '—' },
        {
          label: 'Applied To',
          value: row.purchaseNo ? `Bill #${row.purchaseNo}` : 'Opening Balance'
        },
        { label: 'Amount', value: formatPkr(row.amount) },
        { label: 'Status', value: row.status === 'ACTIVE' ? 'Active' : 'Cancelled' },
        { label: 'Notes', value: row.notes || '—' }
      ]
    }
  ]
};

// ---------------------------------------------------------------------------
// SupplierPaymentsTable Component
// ---------------------------------------------------------------------------

interface SupplierPaymentsTableProps {
  toolbarAction?: ReactNode;
}

export function SupplierPaymentsTable({ toolbarAction }: SupplierPaymentsTableProps) {
  const t = useT();

  const [recordOpen, setRecordOpen] = useState(false);
  const [cancelPaymentTarget, setCancelPaymentTarget] = useState<SupplierPaymentDTO | null>(null);
  const [detailPayment, setDetailPayment] = useState<SupplierPaymentDTO | null>(null);

  const sortableColumnIds = [
    'supplierName',
    'paymentDate',
    'amount',
    'status',
    'createdAt',
    'updatedAt'
  ];
  const { params } = useDukaanListParams(sortableColumnIds, 'paymentDate', ['status']);

  const [searchParam] = useQueryState('search', parseAsString);
  const [statusParam] = useQueryState('status', parseAsString);

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
  let sortBy: SupplierPaymentQueryFilter['sortBy'] = 'paymentDate';
  let sortOrder: 'asc' | 'desc' = 'desc';

  if (sortItem && sortableColumnIds.includes(sortItem.id)) {
    sortBy = sortItem.id as SupplierPaymentQueryFilter['sortBy'];
    sortOrder = sortItem.desc ? 'desc' : 'asc';
  }

  const { data, isLoading, isFetching } = useQuery(
    supplierPaymentsQueryOptions({
      page: params.page,
      pageSize: params.perPage,
      search: searchParam || undefined,
      status: statusFilter,
      sortBy,
      sortOrder
    })
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / params.perPage));

  const columns: ColumnDef<SupplierPaymentDTO>[] = [
    {
      id: 'supplierName',
      accessorKey: 'supplierName',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier' />,
      cell: ({ row }) => (
        <span className='font-normal text-foreground'>
          {row.original.supplierName || <span className='text-muted-foreground italic'>—</span>}
        </span>
      ),
      meta: {
        label: 'table.col.supplier',
        placeholderKey: 'search.supplierPayments',
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
      id: 'paymentDate',
      accessorKey: 'paymentDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
      cell: ({ row }) => {
        const val = row.original.paymentDate;
        const formatted = val ? val.split('T')[0] : '—';
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
      id: 'amount',
      accessorKey: 'amount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
      cell: ({ row }) => (
        <span className='font-normal text-foreground'>{formatPkr(row.original.amount)}</span>
      ),
      meta: {
        label: 'table.col.amount',
        variant: 'number',
        priority: 1,
        mobile: 'value'
      },
      enableColumnFilter: false,
      enableSorting: true
    },
    {
      id: 'target',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Applied To' />,
      cell: ({ row }) => (
        <span className='font-normal text-foreground'>
          {row.original.purchaseNo ? `Bill #${row.original.purchaseNo}` : 'Opening Balance'}
        </span>
      ),
      meta: {
        label: 'table.col.target',
        variant: 'text',
        priority: 3,
        mobile: 'subtitle'
      },
      enableColumnFilter: false,
      enableSorting: false
    },
    {
      id: 'notes',
      accessorKey: 'notes',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Notes' />,
      cell: ({ row }) => (
        <span className='font-normal text-muted-foreground truncate max-w-[200px] inline-block'>
          {row.original.notes || '—'}
        </span>
      ),
      meta: {
        label: 'table.col.notes',
        variant: 'text',
        priority: 4,
        mobile: 'hidden'
      },
      enableColumnFilter: false,
      enableSorting: false
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
      header: () => (
        <span className='h-8 inline-flex items-center text-xs font-medium text-foreground'>
          {t('table.actions')}
        </span>
      ),
      cell: ({ row }) => (
        <SupplierPaymentRowActions
          payment={row.original}
          onCancel={(p) => setCancelPaymentTarget(p)}
        />
      ),
      enableSorting: false
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
      pagination: { pageIndex: 0, pageSize: 20 }
    }
  });

  const recordActionButton = (
    <div className='flex items-center gap-2'>
      {toolbarAction}
      <Button size='sm' className='h-8 gap-1.5' onClick={() => setRecordOpen(true)}>
        <Icons.add className='h-3.5 w-3.5' />
        <span>Add Payment</span>
      </Button>
    </div>
  );

  return (
    <>
      {recordOpen && <RecordSupplierPaymentDialog open={recordOpen} onOpenChange={setRecordOpen} />}

      {cancelPaymentTarget && (
        <CancelSupplierPaymentDialog
          payment={cancelPaymentTarget}
          open={!!cancelPaymentTarget}
          onOpenChange={(open) => {
            if (!open) setCancelPaymentTarget(null);
          }}
        />
      )}

      {detailPayment && (
        <SupplierPaymentDetailSheet
          payment={detailPayment}
          open={!!detailPayment}
          onOpenChange={(open) => {
            if (!open) setDetailPayment(null);
          }}
          onCancelClick={(p) => setCancelPaymentTarget(p)}
        />
      )}

      <ResponsiveDataTable
        table={table}
        toolbarAction={recordActionButton}
        mobileItem={supplierPaymentMobileItem}
        detail={supplierPaymentDetail}
        isLoading={isLoading || isFetching}
        rowCount={items.length > 0 ? items.length : total > 0 ? total : undefined}
      />
    </>
  );
}
