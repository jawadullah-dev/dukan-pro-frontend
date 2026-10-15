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
import { createActiveCancelledStatusColumn } from '@/components/common/party-table-helpers';
import type {
  ExpenseDTO,
  ExpenseQueryFilter,
  ExpenseRowActionsProps,
  ExpensesTableProps
} from '@/types/expense';
import { useState } from 'react';
import { expensesQueryOptions } from '../api/queries';
import { CancelExpenseDialog } from './cancel-expense-dialog';
import { RecordExpenseDialog } from './record-expense-dialog';
import { ExpenseDetailSheet } from './expense-detail-sheet';

function ExpenseRowActions({ expense, onCancel }: ExpenseRowActionsProps) {
  const t = useT();
  const isCancelled = expense.status === 'CANCELLED';

  if (isCancelled) return null;

  return (
    <div onClick={(e) => e.stopPropagation()} data-slot='action-cell'>
      <RowActionsMenu
        actions={[
          {
            label: t('expenses.cancelAction'),
            icon: Icons.close,
            variant: 'destructive',
            onClick: () => onCancel(expense)
          }
        ]}
      />
    </div>
  );
}

const expenseMobileItem: MobileItemConfig<ExpenseDTO> = {
  title: (row: ExpenseDTO) => row.categoryName,
  subtitle: (row: ExpenseDTO) => row.description || '—',
  value: (row: ExpenseDTO) => formatPkr(row.amount),
  badge: (row: ExpenseDTO) => ({
    label: row.status === 'ACTIVE' ? 'Active' : 'Cancelled',
    status: row.status
  }),
  meta: [(row: ExpenseDTO) => formatIsoDate(row.expenseDate)]
};

const expenseDetail: DetailConfig<ExpenseDTO> = {
  mode: 'sheet',
  title: (row: ExpenseDTO) => row.categoryName,
  badge: (row: ExpenseDTO) => ({
    label: row.status === 'ACTIVE' ? 'Active' : 'Cancelled',
    status: row.status
  }),
  value: (row: ExpenseDTO) => formatPkr(row.amount),
  sections: (row: ExpenseDTO) => [
    {
      title: 'Expense Details',
      fields: [
        { label: 'Date', value: formatIsoDate(row.expenseDate) },
        { label: 'Category', value: row.categoryName },
        { label: 'Amount', value: formatPkr(row.amount) },
        { label: 'Status', value: row.status === 'ACTIVE' ? 'Active' : 'Cancelled' },
        { label: 'Description', value: row.description || '—' }
      ]
    }
  ]
};

export function ExpensesTable({ toolbarAction }: ExpensesTableProps) {
  const t = useT();

  const [recordOpen, setRecordOpen] = useState(false);
  const [cancelExpenseTarget, setCancelExpenseTarget] = useState<ExpenseDTO | null>(null);
  const [detailExpense, setDetailExpense] = useState<ExpenseDTO | null>(null);

  const sortableColumnIds = [
    'expenseDate',
    'categoryName',
    'amount',
    'description',
    'status',
    'createdAt'
  ];
  const { params, sortBy, sortOrder, getPageCount } = useDukaanListParams<
    ExpenseQueryFilter['sortBy']
  >(sortableColumnIds, 'expenseDate', ['status'], 'expenseDate');

  const [searchParam] = useQueryState('search', parseAsString);
  const [statusParam] = useQueryState('status', parseAsString);

  const statusFilter = parseActiveCancelledStatus(statusParam);

  const { data, isLoading, isFetching } = useQuery(
    expensesQueryOptions({
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

  const columns: ColumnDef<ExpenseDTO>[] = [
    {
      id: 'expenseDate',
      accessorKey: 'expenseDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.date')} />,
      cell: ({ row }) => (
        <span className='font-normal text-foreground'>
          {formatIsoDate(row.original.expenseDate)}
        </span>
      ),
      meta: {
        label: 'table.col.date',
        variant: 'date',
        priority: 1,
        mobile: 'meta'
      },
      enableColumnFilter: false,
      enableSorting: true
    },
    {
      id: 'categoryName',
      accessorKey: 'categoryName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.category')} />
      ),
      cell: ({ row }) => (
        <span className='font-medium text-foreground'>{row.original.categoryName}</span>
      ),
      meta: {
        label: 'table.col.category',
        placeholderKey: 'search.expenses',
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
      id: 'amount',
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.amount')} />
      ),
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
      id: 'description',
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.description')} />
      ),
      cell: ({ row }) => (
        <span className='font-normal text-muted-foreground truncate max-w-[260px] inline-block'>
          {row.original.description || '—'}
        </span>
      ),
      meta: {
        label: 'table.col.description',
        variant: 'text',
        priority: 3,
        mobile: 'subtitle'
      },
      enableColumnFilter: false,
      enableSorting: true
    },
    createActiveCancelledStatusColumn<ExpenseDTO>(t('table.col.status')),
    {
      id: 'actions',
      size: 72,
      header: () => (
        <span className='h-8 inline-flex items-center text-xs font-medium text-foreground'>
          {t('table.actions')}
        </span>
      ),
      cell: ({ row }) => (
        <ExpenseRowActions expense={row.original} onCancel={(e) => setCancelExpenseTarget(e)} />
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
        <span>{t('expenses.addExpense')}</span>
      </Button>
    </div>
  );

  return (
    <>
      {recordOpen && <RecordExpenseDialog open={recordOpen} onOpenChange={setRecordOpen} />}

      {cancelExpenseTarget && (
        <CancelExpenseDialog
          expense={cancelExpenseTarget}
          open={!!cancelExpenseTarget}
          onOpenChange={(open) => {
            if (!open) setCancelExpenseTarget(null);
          }}
        />
      )}

      {detailExpense && (
        <ExpenseDetailSheet
          expense={detailExpense}
          open={!!detailExpense}
          onOpenChange={(open) => {
            if (!open) setDetailExpense(null);
          }}
          onCancelClick={(e) => setCancelExpenseTarget(e)}
        />
      )}

      <ResponsiveDataTable
        table={table}
        toolbarAction={recordActionButton}
        mobileItem={expenseMobileItem}
        detail={expenseDetail}
        isLoading={isLoading || isFetching}
        rowCount={items.length > 0 ? items.length : total > 0 ? total : undefined}
      />
    </>
  );
}
