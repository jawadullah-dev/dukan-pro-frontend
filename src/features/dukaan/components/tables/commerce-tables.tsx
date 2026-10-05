'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import type { ExpenseCategory } from '@/lib/dukaan/types';
import { formatDateTime, formatLabel, formatPkr } from '@/lib/dukaan/numbers';
import {
  cashQueryOptions,
  customersQueryOptions,
  expenseCategoriesQueryOptions,
  expensesQueryOptions,
  inventoryMovementsQueryOptions,
  paymentsQueryOptions,
  purchasesQueryOptions,
  salesQueryOptions,
  stockQueryOptions,
  supplierPaymentsQueryOptions,
  suppliersQueryOptions
} from '../../api/queries';
import {
  CASH_DIRECTION_OPTIONS,
  CASH_TYPE_OPTIONS,
  LOW_STOCK_OPTIONS,
  MOVEMENT_TYPE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  RECORD_STATUS_OPTIONS,
  TRACKING_TYPE_OPTIONS
} from '../../constants/filters';
import { RowActionsMenu } from '../row-actions-menu';
import { ExpenseCellAction } from '../expense-cell-actions';
import { ExpenseCategoryCellAction } from '../expense-category-cell-actions';
import { PaymentCellAction } from '../payment-cell-actions';
import { SupplierPaymentCellAction } from '../supplier-payment-cell-actions';
import { DUKAAN_DEFAULT_PAGE_SIZE, useDukaanListParams } from './list-params';

interface TableToolbarProps {
  toolbarAction?: ReactNode;
}

function useDukaanTable<TData>(
  data: TData[],
  columns: ColumnDef<TData>[],
  total: number,
  perPage: number
) {
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  return useDataTable({
    data,
    columns,
    pageCount,
    rowCount: total,
    shallow: true,
    debounceMs: 400,
    initialState: {
      pagination: { pageIndex: 0, pageSize: DUKAAN_DEFAULT_PAGE_SIZE }
    }
  });
}

type SupplierRow = {
  id: string;
  name: string;
  phone: string;
  payable: number;
  is_active: boolean;
  is_system: boolean;
};

const supplierColumns: ColumnDef<SupplierRow>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
    cell: ({ row }) => (
      <span>
        {row.original.name}
        {row.original.is_system ? (
          <Badge className='ml-2' variant='outline'>
            System
          </Badge>
        ) : null}
      </span>
    ),
    meta: {
      label: 'Name',
      placeholder: 'Search suppliers...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Phone' />,
    meta: { label: 'Phone' }
  },
  {
    id: 'payable',
    accessorKey: 'payable',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Payable' />,
    meta: { label: 'Payable' },
    cell: ({ row }) => formatPkr(row.original.payable)
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    meta: { label: 'Status' },
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
        {row.original.is_active ? 'Active' : 'Inactive'}
      </Badge>
    )
  }
];

export function SuppliersTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['name', 'phone', 'payable', 'is_active'];
  const { params, filters } = useDukaanListParams(columnIds);
  const { data } = useSuspenseQuery(suppliersQueryOptions(filters));
  const { table } = useDukaanTable(data.items, supplierColumns, data.total, params.perPage);
  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>{toolbarAction}</DataTableToolbar>
    </DataTable>
  );
}

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  udhar: number;
};

const customerColumns: ColumnDef<CustomerRow>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
    meta: {
      label: 'Name',
      placeholder: 'Search customers...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Phone' />,
    meta: { label: 'Phone' }
  },
  {
    id: 'udhar',
    accessorKey: 'udhar',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Udhar' />,
    meta: { label: 'Udhar' },
    cell: ({ row }) => formatPkr(row.original.udhar)
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <RowActionsMenu
          actions={[
            {
              label: 'Ledger',
              href: `/dashboard/customers/${row.original.id}`,
              icon: Icons.page
            }
          ]}
        />
      </div>
    )
  }
];

export function CustomersTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['name', 'phone', 'udhar'];
  const { params, filters } = useDukaanListParams(columnIds);
  const { data } = useSuspenseQuery(customersQueryOptions(filters));
  const { table } = useDukaanTable(data.items, customerColumns, data.total, params.perPage);
  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>{toolbarAction}</DataTableToolbar>
    </DataTable>
  );
}

type PurchaseRow = {
  id: string;
  purchase_no: string;
  purchase_date: string;
  supplier_invoice_ref?: string;
  total_amount: number;
  status: string;
  is_opening_stock?: boolean;
};

const purchaseColumns: ColumnDef<PurchaseRow>[] = [
  {
    id: 'purchase_no',
    accessorKey: 'purchase_no',
    header: ({ column }) => <DataTableColumnHeader column={column} title='No' />,
    meta: {
      label: 'No',
      placeholder: 'Search purchases...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'purchase_date',
    accessorKey: 'purchase_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
    meta: { label: 'Date' }
  },
  {
    id: 'supplier_invoice_ref',
    accessorKey: 'supplier_invoice_ref',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier invoice' />,
    meta: { label: 'Supplier invoice' },
    cell: ({ row }) => row.original.supplier_invoice_ref ?? '—'
  },
  {
    id: 'total_amount',
    accessorKey: 'total_amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Total' />,
    meta: { label: 'Total' },
    cell: ({ row }) => formatPkr(row.original.total_amount)
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: [...RECORD_STATUS_OPTIONS]
    },
    enableColumnFilter: true,
    cell: ({ row }) => (
      <span className='inline-flex flex-wrap items-center gap-1'>
        <Badge variant={row.original.status === 'ACTIVE' ? 'default' : 'secondary'}>
          {formatLabel(row.original.status)}
        </Badge>
        {row.original.is_opening_stock ? <Badge variant='outline'>Opening</Badge> : null}
      </span>
    )
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <RowActionsMenu
          actions={[
            {
              label: 'Open',
              href: `/dashboard/purchases/${row.original.id}`,
              icon: Icons.page
            }
          ]}
        />
      </div>
    )
  }
];

export function PurchasesTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['purchase_no', 'purchase_date', 'total_amount', 'status'];
  const { params, filters } = useDukaanListParams(columnIds, 'purchase_no', ['status']);
  const { data } = useSuspenseQuery(purchasesQueryOptions(filters));
  const { table } = useDukaanTable(data.items, purchaseColumns, data.total, params.perPage);
  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>{toolbarAction}</DataTableToolbar>
    </DataTable>
  );
}

type SaleRow = {
  id: string;
  sale_no: string;
  sale_date: string;
  total_amount: number;
  outstanding: number;
  status: string;
};

const saleColumns: ColumnDef<SaleRow>[] = [
  {
    id: 'sale_no',
    accessorKey: 'sale_no',
    header: ({ column }) => <DataTableColumnHeader column={column} title='No' />,
    meta: {
      label: 'No',
      placeholder: 'Search sales...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'sale_date',
    accessorKey: 'sale_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
    meta: { label: 'Date' }
  },
  {
    id: 'total_amount',
    accessorKey: 'total_amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Total' />,
    meta: { label: 'Total' },
    cell: ({ row }) => formatPkr(row.original.total_amount)
  },
  {
    id: 'outstanding',
    accessorKey: 'outstanding',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Outstanding' />,
    meta: { label: 'Outstanding' },
    cell: ({ row }) => formatPkr(row.original.outstanding)
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: [...RECORD_STATUS_OPTIONS]
    },
    enableColumnFilter: true,
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'ACTIVE' ? 'default' : 'secondary'}>
        {formatLabel(row.original.status)}
      </Badge>
    )
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <RowActionsMenu
          actions={[
            {
              label: 'Open',
              href: `/dashboard/sales/${row.original.id}`,
              icon: Icons.page
            },
            {
              label: 'Receipt',
              href: `/dashboard/sales/${row.original.id}/receipt`,
              icon: Icons.receipt
            }
          ]}
        />
      </div>
    )
  }
];

export function SalesTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['sale_no', 'sale_date', 'total_amount', 'outstanding', 'status'];
  const { params, filters } = useDukaanListParams(columnIds, 'sale_no', ['status']);
  const { data } = useSuspenseQuery(salesQueryOptions(filters));
  const { table } = useDukaanTable(data.items, saleColumns, data.total, params.perPage);
  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>{toolbarAction}</DataTableToolbar>
    </DataTable>
  );
}

type ExpenseRow = {
  id: string;
  expense_date: string;
  amount: number;
  description?: string;
  status: string;
  category_name?: string;
};

const expenseColumns: ColumnDef<ExpenseRow>[] = [
  {
    id: 'expense_date',
    accessorKey: 'expense_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
    meta: {
      label: 'Date',
      placeholder: 'Search expenses...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'category_name',
    accessorKey: 'category_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
    meta: { label: 'Category' },
    cell: ({ row }) => row.original.category_name ?? '—'
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
    meta: { label: 'Amount' },
    cell: ({ row }) => formatPkr(row.original.amount)
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
    meta: { label: 'Description' },
    cell: ({ row }) => row.original.description ?? '—'
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: [...RECORD_STATUS_OPTIONS]
    },
    enableColumnFilter: true,
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'ACTIVE' ? 'default' : 'secondary'}>
        {formatLabel(row.original.status)}
      </Badge>
    )
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <ExpenseCellAction data={row.original} />
      </div>
    )
  }
];

export function ExpensesTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['expense_date', 'category_name', 'amount', 'description', 'status'];
  const { params, filters } = useDukaanListParams(columnIds, 'expense_date', ['status']);
  const { data } = useSuspenseQuery(expensesQueryOptions(filters));
  const { table } = useDukaanTable(data.items, expenseColumns, data.total, params.perPage);
  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>{toolbarAction}</DataTableToolbar>
    </DataTable>
  );
}

type ExpenseCategoryRow = ExpenseCategory;

const expenseCategoryColumns: ColumnDef<ExpenseCategoryRow>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
    meta: {
      label: 'Name',
      placeholder: 'Search categories...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    meta: { label: 'Status' },
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
        {row.original.is_active ? 'Active' : 'Inactive'}
      </Badge>
    )
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <ExpenseCategoryCellAction data={row.original} />
      </div>
    )
  }
];

export function ExpenseCategoriesTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['name', 'is_active'];
  const { params, filters } = useDukaanListParams(columnIds);
  const { data } = useSuspenseQuery(expenseCategoriesQueryOptions(filters));
  const { table } = useDukaanTable(data.items, expenseCategoryColumns, data.total, params.perPage);
  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>{toolbarAction}</DataTableToolbar>
    </DataTable>
  );
}

type CashRow = {
  id: string;
  created_at: string;
  type: string;
  direction: string;
  amount: number;
  note?: string;
  is_overdraft: boolean;
  reverses_movement_id?: string;
};

const cashColumns: ColumnDef<CashRow>[] = [
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='When' />,
    cell: ({ row }) => formatDateTime(row.original.created_at),
    meta: {
      label: 'When',
      placeholder: 'Search cash ledger...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
    meta: {
      label: 'Type',
      variant: 'multiSelect',
      options: [...CASH_TYPE_OPTIONS]
    },
    enableColumnFilter: true,
    cell: ({ row }) => (
      <span>
        {formatLabel(row.original.type)}
        {row.original.is_overdraft ? (
          <Badge className='ml-2' variant='destructive'>
            Overdraft
          </Badge>
        ) : null}
      </span>
    )
  },
  {
    id: 'direction',
    accessorKey: 'direction',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Dir' />,
    meta: {
      label: 'Dir',
      variant: 'multiSelect',
      options: [...CASH_DIRECTION_OPTIONS]
    },
    enableColumnFilter: true,
    cell: ({ row }) => formatLabel(row.original.direction)
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
    meta: { label: 'Amount' },
    cell: ({ row }) => formatPkr(row.original.amount)
  },
  {
    id: 'note',
    accessorKey: 'note',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Note' />,
    meta: { label: 'Note' },
    cell: ({ row }) => {
      const note = row.original.note;
      const rev = row.original.reverses_movement_id;
      if (!note && !rev) return '—';
      return (
        <span>
          {note ?? ''}
          {rev ? (
            <span className='text-muted-foreground'>
              {note ? ' · ' : ''}reverses {rev.slice(0, 10)}…
            </span>
          ) : null}
        </span>
      );
    }
  }
];

export function CashTable() {
  const columnIds = ['created_at', 'type', 'direction', 'amount', 'note'];
  const { params, filters } = useDukaanListParams(columnIds, 'created_at', ['type', 'direction']);
  const { data } = useSuspenseQuery(cashQueryOptions(filters));
  const { table } = useDukaanTable(data.items, cashColumns, data.total, params.perPage);
  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}

type StockRow = {
  id: string;
  product_name: string;
  tracking_type: string;
  quantity: number;
  avg_unit_cost: number;
  low_stock: boolean;
};

const stockColumns: ColumnDef<StockRow>[] = [
  {
    id: 'product_name',
    accessorKey: 'product_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Product' />,
    meta: {
      label: 'Product',
      placeholder: 'Search inventory...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'tracking_type',
    accessorKey: 'tracking_type',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tracking type' />,
    meta: {
      label: 'Tracking type',
      variant: 'multiSelect',
      options: [...TRACKING_TYPE_OPTIONS]
    },
    enableColumnFilter: true,
    cell: ({ row }) => <Badge variant='outline'>{formatLabel(row.original.tracking_type)}</Badge>
  },
  {
    id: 'quantity',
    accessorKey: 'quantity',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Qty' />,
    meta: { label: 'Qty' }
  },
  {
    id: 'avg_unit_cost',
    accessorKey: 'avg_unit_cost',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Avg cost' />,
    meta: { label: 'Avg cost' },
    cell: ({ row }) => formatPkr(row.original.avg_unit_cost)
  },
  {
    id: 'low_stock',
    accessorKey: 'low_stock',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Alert' />,
    meta: {
      label: 'Alert',
      variant: 'multiSelect',
      options: [...LOW_STOCK_OPTIONS]
    },
    enableColumnFilter: true,
    cell: ({ row }) => (row.original.low_stock ? <Badge variant='destructive'>Low</Badge> : 'OK')
  }
];

export function InventoryTable() {
  const columnIds = ['product_name', 'tracking_type', 'quantity', 'avg_unit_cost', 'low_stock'];
  const { params, filters } = useDukaanListParams(columnIds, 'product_name', [
    'tracking_type',
    'low_stock'
  ]);
  const { data } = useSuspenseQuery(stockQueryOptions(filters));
  const { table } = useDukaanTable(data.items, stockColumns, data.total, params.perPage);
  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}

type SupplierPaymentRow = {
  id: string;
  created_at: string;
  payment_date: string;
  amount: number;
  notes?: string;
  status: string;
  supplier_name?: string;
};

const supplierPaymentColumns: ColumnDef<SupplierPaymentRow>[] = [
  {
    id: 'payment_date',
    accessorKey: 'payment_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
    meta: {
      label: 'Date',
      placeholder: 'Search payments...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'supplier_name',
    accessorKey: 'supplier_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier' />,
    meta: { label: 'Supplier' },
    cell: ({ row }) => row.original.supplier_name ?? '—'
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
    meta: { label: 'Amount' },
    cell: ({ row }) => formatPkr(row.original.amount)
  },
  {
    id: 'notes',
    accessorKey: 'notes',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Notes' />,
    meta: { label: 'Notes' },
    cell: ({ row }) => row.original.notes ?? '—'
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: [...RECORD_STATUS_OPTIONS]
    },
    enableColumnFilter: true,
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'ACTIVE' ? 'default' : 'secondary'}>
        {formatLabel(row.original.status)}
      </Badge>
    )
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <SupplierPaymentCellAction data={row.original} />
      </div>
    )
  }
];

export function SupplierPaymentsTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['payment_date', 'supplier_name', 'amount', 'notes', 'status'];
  const { params, filters } = useDukaanListParams(columnIds, 'payment_date', ['status']);
  const { data } = useSuspenseQuery(supplierPaymentsQueryOptions(filters));
  const { table } = useDukaanTable(data.items, supplierPaymentColumns, data.total, params.perPage);
  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>{toolbarAction}</DataTableToolbar>
    </DataTable>
  );
}

type MovementRow = {
  id: string;
  created_at: string;
  type: string;
  quantity_change: number;
  product_name?: string;
  imei1?: string;
  reason?: string;
};

const movementColumns: ColumnDef<MovementRow>[] = [
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='When' />,
    cell: ({ row }) => formatDateTime(row.original.created_at),
    meta: {
      label: 'When',
      placeholder: 'Search movements...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
    meta: {
      label: 'Type',
      variant: 'multiSelect',
      options: [...MOVEMENT_TYPE_OPTIONS]
    },
    enableColumnFilter: true,
    cell: ({ row }) => formatLabel(row.original.type)
  },
  {
    id: 'product_name',
    accessorKey: 'product_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Product' />,
    meta: { label: 'Product' },
    cell: ({ row }) => row.original.product_name ?? '—'
  },
  {
    id: 'imei1',
    accessorKey: 'imei1',
    header: ({ column }) => <DataTableColumnHeader column={column} title='IMEI1' />,
    meta: { label: 'IMEI1' },
    cell: ({ row }) => row.original.imei1 ?? '—'
  },
  {
    id: 'quantity_change',
    accessorKey: 'quantity_change',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Qty Δ' />,
    meta: { label: 'Qty Δ' }
  },
  {
    id: 'reason',
    accessorKey: 'reason',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Reason' />,
    meta: { label: 'Reason' },
    cell: ({ row }) => row.original.reason ?? '—'
  }
];

export function MovementsTable() {
  const columnIds = ['created_at', 'type', 'product_name', 'imei1', 'quantity_change', 'reason'];
  const { params, filters } = useDukaanListParams(columnIds, 'created_at', ['type']);
  const { data } = useSuspenseQuery(inventoryMovementsQueryOptions(filters));
  const { table } = useDukaanTable(data.items, movementColumns, data.total, params.perPage);
  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}

type PaymentRow = {
  id: string;
  created_at: string;
  amount: number;
  method: string;
  status: string;
  receipt_group_id: string;
  customer_name?: string;
  sale_no?: string;
};

const paymentColumns: ColumnDef<PaymentRow>[] = [
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='When' />,
    cell: ({ row }) => formatDateTime(row.original.created_at),
    meta: {
      label: 'When',
      placeholder: 'Search payments...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'customer_name',
    accessorKey: 'customer_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Customer' />,
    meta: { label: 'Customer' },
    cell: ({ row }) => row.original.customer_name ?? 'Walk-in'
  },
  {
    id: 'sale_no',
    accessorKey: 'sale_no',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Sale' />,
    meta: { label: 'Sale' },
    cell: ({ row }) => row.original.sale_no ?? '—'
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
    meta: { label: 'Amount' },
    cell: ({ row }) => formatPkr(row.original.amount)
  },
  {
    id: 'method',
    accessorKey: 'method',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Method' />,
    meta: {
      label: 'Method',
      variant: 'multiSelect',
      options: [...PAYMENT_METHOD_OPTIONS]
    },
    enableColumnFilter: true,
    cell: ({ row }) => formatLabel(row.original.method)
  },
  {
    id: 'receipt_group_id',
    accessorKey: 'receipt_group_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Receipt group' />,
    meta: { label: 'Receipt group' },
    cell: ({ row }) => (
      <span className='font-mono text-xs'>{row.original.receipt_group_id.slice(0, 12)}…</span>
    )
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: [...RECORD_STATUS_OPTIONS]
    },
    enableColumnFilter: true,
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'ACTIVE' ? 'default' : 'secondary'}>
        {formatLabel(row.original.status)}
      </Badge>
    )
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <PaymentCellAction data={row.original} />
      </div>
    )
  }
];

export function PaymentsTable() {
  const columnIds = [
    'created_at',
    'customer_name',
    'sale_no',
    'amount',
    'method',
    'receipt_group_id',
    'status'
  ];
  const { params, filters } = useDukaanListParams(columnIds, 'created_at', ['status', 'method']);
  const { data } = useSuspenseQuery(paymentsQueryOptions(filters));
  const { table } = useDukaanTable(data.items, paymentColumns, data.total, params.perPage);
  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
