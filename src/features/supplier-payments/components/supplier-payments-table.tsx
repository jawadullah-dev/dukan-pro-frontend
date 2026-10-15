'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { parseAsString, useQueryState } from 'nuqs';
import { useT } from '@/i18n/use-t';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { RowActionsMenu } from '@/components/common/row-actions-menu';
import {
  ResponsiveDataTable,
  type DetailConfig,
  type MobileItemConfig
} from '@/components/data-table';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useDataTable } from '@/hooks/use-data-table';
import {
  parseActiveCancelledStatus,
  useDukaanListParams
} from '@/components/data-table/list-params';
import { formatIsoDate } from '@/lib/dates';
import { formatPkr } from '@/lib/dukaan/numbers';
import {
  createActiveCancelledStatusColumn,
  createAmountColumn
} from '@/components/common/party-table-helpers';
import type {
  SupplierPaymentDTO,
  SupplierPaymentQueryFilter,
  SupplierPaymentRowActionsProps,
  SupplierPaymentsTableProps
} from '@/types/supplier-payment';
import { useState } from 'react';
import { supplierPaymentsQueryOptions } from '../api/queries';
import { CancelSupplierPaymentDialog } from './cancel-supplier-payment-dialog';
import { RecordSupplierPaymentDialog } from './record-supplier-payment-dialog';
import { SupplierPaymentDetailSheet } from './supplier-payment-detail-sheet';

function SupplierPaymentRowActions({ payment, onCancel }: SupplierPaymentRowActionsProps) {
  const t = useT();
  const isCancelled = payment.status === 'CANCELLED';

  if (isCancelled) return null;

  return (
    <div onClick={(e) => e.stopPropagation()} data-slot='action-cell'>
      <RowActionsMenu
        actions={[
          {
            label: t('common.cancel'),
            icon: Icons.close,
            variant: 'destructive',
            onClick: () => onCancel(payment)
          }
        ]}
      />
    </div>
  );
}

const supplierPaymentMobileItem: MobileItemConfig<SupplierPaymentDTO> = {
  title: (row: SupplierPaymentDTO) => row.supplierName || 'Supplier',
  subtitle: (row: SupplierPaymentDTO) =>
    row.purchaseNo ? `Bill #${row.purchaseNo}` : 'Opening Balance',
  value: (row: SupplierPaymentDTO) => formatPkr(row.amount),
  badge: (row: SupplierPaymentDTO) => ({
    label: row.status === 'ACTIVE' ? 'Active' : 'Cancelled',
    status: row.status
  }),
  meta: [(row: SupplierPaymentDTO) => formatIsoDate(row.paymentDate)]
};

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
        { label: 'Date', value: formatIsoDate(row.paymentDate) },
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
  const { params, sortBy, sortOrder, getPageCount } = useDukaanListParams<
    SupplierPaymentQueryFilter['sortBy']
  >(sortableColumnIds, 'paymentDate', ['status'], 'paymentDate');

  const [searchParam] = useQueryState('search', parseAsString);
  const [statusParam] = useQueryState('status', parseAsString);

  const statusFilter = parseActiveCancelledStatus(statusParam);

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
  const pageCount = getPageCount(total);

  const columns: ColumnDef<SupplierPaymentDTO>[] = [
    {
      id: 'supplierName',
      accessorKey: 'supplierName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.supplier')} />
      ),
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
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.date')} />,
      cell: ({ row }) => (
        <span className='font-normal text-foreground'>
          {formatIsoDate(row.original.paymentDate)}
        </span>
      ),
      meta: {
        label: 'table.col.date',
        variant: 'date',
        priority: 2,
        mobile: 'meta'
      },
      enableColumnFilter: false,
      enableSorting: true
    },
    createAmountColumn<SupplierPaymentDTO>(t('table.col.amount')),
    {
      id: 'target',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('supplierPayments.appliedTo')} />
      ),
      cell: ({ row }) => (
        <span className='font-normal text-foreground'>
          {row.original.purchaseNo
            ? `Bill #${row.original.purchaseNo}`
            : t('supplierPayments.openingBalance')}
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.notes')} />
      ),
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
    createActiveCancelledStatusColumn<SupplierPaymentDTO>(t('table.col.status')),
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
      <Button type='button' size='sm' className='h-8 gap-1.5' onClick={() => setRecordOpen(true)}>
        <Icons.add className='h-3.5 w-3.5' />
        <span>{t('supplierPayments.addPayment')}</span>
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
