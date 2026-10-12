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
import type { ExpenseDTO, ExpenseQueryFilter } from '@/types/expense';
import { useState, type ReactNode } from 'react';
import { expensesQueryOptions } from '../api/queries';
import { CancelExpenseDialog } from './cancel-expense-dialog';
import { RecordExpenseDialog } from './record-expense-dialog';
import { ExpenseDetailSheet } from './expense-detail-sheet';

// ---------------------------------------------------------------------------
// Row Actions
// ---------------------------------------------------------------------------

interface ExpenseRowActionsProps {
  expense: ExpenseDTO;
  onCancel: (expense: ExpenseDTO) => void;
}

function ExpenseRowActions({ expense, onCancel }: ExpenseRowActionsProps) {
  const isCancelled = expense.status === 'CANCELLED';

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
                requestAnimationFrame(() => onCancel(expense));
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

const expenseMobileItem: MobileItemConfig<ExpenseDTO> = {
  title: (row: ExpenseDTO) => row.categoryName,
  subtitle: (row: ExpenseDTO) => row.description || '—',
  value: (row: ExpenseDTO) => formatPkr(row.amount),
  badge: (row: ExpenseDTO) => ({
    label: row.status === 'ACTIVE' ? 'Active' : 'Cancelled',
    status: row.status
  }),
  meta: [(row: ExpenseDTO) => (row.expenseDate ? row.expenseDate.split('T')[0] : '—')]
};

// ---------------------------------------------------------------------------
// Detail Configuration
// ---------------------------------------------------------------------------

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
        { label: 'Date', value: row.expenseDate ? row.expenseDate.split('T')[0] : '—' },
        { label: 'Category', value: row.categoryName },
        { label: 'Amount', value: formatPkr(row.amount) },
        { label: 'Status', value: row.status === 'ACTIVE' ? 'Active' : 'Cancelled' },
        { label: 'Description', value: row.description || '—' }
      ]
    }
  ]
};

// ---------------------------------------------------------------------------
// ExpensesTable Component
// ---------------------------------------------------------------------------

interface ExpensesTableProps {
  toolbarAction?: ReactNode;
}

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
  const { params } = useDukaanListParams(sortableColumnIds, 'expenseDate', ['status']);

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
  let sortBy: ExpenseQueryFilter['sortBy'] = 'expenseDate';
  let sortOrder: 'asc' | 'desc' = 'desc';

  if (sortItem && sortableColumnIds.includes(sortItem.id)) {
    sortBy = sortItem.id as ExpenseQueryFilter['sortBy'];
    sortOrder = sortItem.desc ? 'desc' : 'asc';
  }

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
  const pageCount = Math.max(1, Math.ceil(total / params.perPage));

  const columns: ColumnDef<ExpenseDTO>[] = [
    {
      id: 'expenseDate',
      accessorKey: 'expenseDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
      cell: ({ row }) => {
        const val = row.original.expenseDate;
        const formatted = val ? val.split('T')[0] : '—';
        return <span className='font-normal text-foreground'>{formatted}</span>;
      },
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
      header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
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
      id: 'description',
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
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
        priority: 2,
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
      <Button size='sm' className='h-8 gap-1.5' onClick={() => setRecordOpen(true)}>
        <Icons.add className='h-3.5 w-3.5' />
        <span>Add expense</span>
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
