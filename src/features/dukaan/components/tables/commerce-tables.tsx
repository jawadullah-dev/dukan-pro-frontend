'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveDataTable,
  StatusBadge,
  type DetailConfig,
  type MobileItemConfig,
  type QuickFilterChip
} from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';
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
      icon: Icons.search,
      type: 'text',
      primary: true,
      priority: 1,
      mobile: 'title'
    },
    enableColumnFilter: true
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Phone' />,
    meta: { label: 'Phone', type: 'phone', priority: 2, mobile: 'subtitle' }
  },
  {
    id: 'payable',
    accessorKey: 'payable',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Payable' />,
    meta: {
      label: 'Payable',
      type: 'money',
      highlight: true,
      priority: 1,
      mobile: 'value'
    },
    cell: ({ row }) => formatPkr(row.original.payable)
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    meta: { label: 'Status', type: 'boolean', priority: 3, mobile: 'badge' },
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.is_active ? 'ACTIVE' : 'INACTIVE'}
        label={row.original.is_active ? 'Active' : 'Inactive'}
      />
    )
  }
];

const supplierMobileItem: MobileItemConfig<SupplierRow> = {
  leading: 'avatar',
  title: (row) => row.name,
  subtitle: (row) => row.phone,
  value: (row) => formatPkr(row.payable),
  valueLabel: () => t('table.youOwe'),
  valueClassName: (row) =>
    cn(row.payable > 0 ? 'text-[var(--status-warning)]' : 'text-muted-foreground'),
  ariaLabel: (row) => `${row.name}, ${row.phone}, ${formatPkr(row.payable)}`
};

const supplierDetail: DetailConfig<SupplierRow> = {
  mode: 'sheet',
  title: (row) => row.name,
  badge: (row) => ({
    label: row.is_active ? 'Active' : 'Inactive',
    status: row.is_active ? 'ACTIVE' : 'INACTIVE'
  }),
  value: (row) => formatPkr(row.payable),
  sections: (row) => [
    {
      title: 'Contact',
      fields: [
        { label: 'Name', value: row.name },
        {
          label: 'Phone',
          value: (
            <a
              className='text-primary underline-offset-2 hover:underline'
              href={`tel:${row.phone}`}
            >
              {row.phone}
            </a>
          )
        }
      ]
    },
    {
      title: 'Balance',
      fields: [
        { label: t('table.youOwe'), value: formatPkr(row.payable) },
        {
          label: 'Status',
          value: (
            <StatusBadge
              status={row.is_active ? 'ACTIVE' : 'INACTIVE'}
              label={row.is_active ? 'Active' : 'Inactive'}
            />
          )
        },
        ...(row.is_system ? [{ label: 'Type', value: 'System' as ReactNode }] : [])
      ]
    }
  ]
};

export function SuppliersTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['name', 'phone', 'payable', 'is_active'];
  const { params, filters } = useDukaanListParams(columnIds);
  const { data } = useSuspenseQuery(suppliersQueryOptions(filters));
  const { table } = useDukaanTable(data.items, supplierColumns, data.total, params.perPage);
  return (
    <ResponsiveDataTable
      table={table}
      toolbarAction={toolbarAction}
      mobileItem={supplierMobileItem}
      detail={supplierDetail}
    />
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
      icon: Icons.search,
      type: 'text',
      primary: true,
      priority: 1,
      mobile: 'title'
    },
    enableColumnFilter: true
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Phone' />,
    meta: { label: 'Phone', type: 'phone', priority: 2, mobile: 'subtitle' }
  },
  {
    id: 'udhar',
    accessorKey: 'udhar',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Udhar' />,
    meta: {
      label: 'Udhar',
      type: 'money',
      highlight: true,
      priority: 1,
      mobile: 'value'
    },
    cell: ({ row }) => formatPkr(row.original.udhar)
  },
  {
    id: 'udhar_state',
    accessorFn: (row) => (row.udhar > 0 ? 'owing' : 'settled'),
    header: ({ column }) => <DataTableColumnHeader column={column} title='Balance' />,
    meta: {
      label: 'Balance',
      variant: 'select',
      options: [
        { label: 'With Udhar', value: 'owing' },
        { label: 'Settled', value: 'settled' }
      ],
      priority: 4,
      mobile: 'hidden'
    },
    enableColumnFilter: true,
    enableHiding: true
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    meta: { mobile: 'hidden' },
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

const customerMobileItem: MobileItemConfig<CustomerRow> = {
  leading: 'avatar',
  title: (row) => row.name,
  subtitle: (row) => row.phone,
  badge: (row) => (row.udhar > 0 ? { label: 'Owing', status: 'OVERDUE', tone: 'danger' } : null),
  value: (row) => formatPkr(row.udhar),
  valueLabel: () => t('table.udhar'),
  valueClassName: (row) =>
    cn(row.udhar > 0 ? 'text-[var(--status-warning)]' : 'text-muted-foreground'),
  ariaLabel: (row) => `${row.name}, ${row.phone}, ${formatPkr(row.udhar)}`
};

const customerDetail: DetailConfig<CustomerRow> = {
  mode: 'page',
  href: (row) => `/dashboard/customers/${row.id}`,
  title: (row) => row.name,
  badge: (row) => (row.udhar > 0 ? { label: 'Owing', status: 'OVERDUE', tone: 'danger' } : null),
  value: (row) => formatPkr(row.udhar),
  sections: (row) => [
    {
      title: 'Contact',
      fields: [
        { label: 'Name', value: row.name },
        {
          label: 'Phone',
          value: (
            <a
              className='text-primary underline-offset-2 hover:underline'
              href={`tel:${row.phone}`}
            >
              {row.phone}
            </a>
          )
        }
      ]
    },
    {
      title: 'Balance',
      fields: [{ label: t('table.udhar'), value: formatPkr(row.udhar) }]
    }
  ]
};

const customerQuickFilters: QuickFilterChip[] = [
  { id: 'all', label: t('table.all') },
  {
    id: 'owing',
    label: t('table.withUdhar'),
    columnId: 'udhar_state',
    value: ['owing']
  },
  {
    id: 'settled',
    label: t('table.zeroUdhar'),
    columnId: 'udhar_state',
    value: ['settled']
  }
];

export function CustomersTable({ toolbarAction }: TableToolbarProps) {
  const router = useRouter();
  const columnIds = ['name', 'phone', 'udhar', 'udhar_state'];
  const { params, filters } = useDukaanListParams(columnIds, 'name', ['udhar_state']);
  const { data } = useSuspenseQuery(customersQueryOptions(filters));
  const pageCount = Math.max(1, Math.ceil(data.total / params.perPage));
  const { table } = useDataTable({
    data: data.items,
    columns: customerColumns,
    pageCount,
    rowCount: data.total,
    shallow: true,
    debounceMs: 400,
    initialState: {
      pagination: { pageIndex: 0, pageSize: DUKAAN_DEFAULT_PAGE_SIZE },
      columnVisibility: { udhar_state: false }
    }
  });

  return (
    <ResponsiveDataTable
      table={table}
      toolbarAction={toolbarAction}
      mobileItem={customerMobileItem}
      detail={{
        ...customerDetail,
        actions: (row) => [
          {
            label: t('table.openLedger'),
            onClick: () => router.push(`/dashboard/customers/${row.id}`)
          }
        ]
      }}
      quickFilters={customerQuickFilters}
    />
  );
}

type PurchaseRow = {
  id: string;
  purchase_no: string;
  purchase_date: string;
  supplier_invoice_ref?: string;
  supplier_name?: string;
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
      icon: Icons.search,
      type: 'id',
      primary: true,
      priority: 1,
      mobile: 'title'
    },
    enableColumnFilter: true
  },
  {
    id: 'purchase_date',
    accessorKey: 'purchase_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
    meta: { label: 'Date', type: 'date', priority: 2, mobile: 'meta' }
  },
  {
    id: 'supplier_name',
    accessorKey: 'supplier_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier' />,
    meta: { label: 'Supplier', type: 'text', priority: 2, mobile: 'subtitle' },
    cell: ({ row }) => row.original.supplier_name ?? '—'
  },
  {
    id: 'supplier_invoice_ref',
    accessorKey: 'supplier_invoice_ref',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier invoice' />,
    meta: { label: 'Supplier invoice', type: 'text', priority: 3, mobile: 'hidden' },
    cell: ({ row }) => row.original.supplier_invoice_ref ?? '—'
  },
  {
    id: 'total_amount',
    accessorKey: 'total_amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Total' />,
    meta: {
      label: 'Total',
      type: 'money',
      highlight: true,
      priority: 1,
      mobile: 'value'
    },
    cell: ({ row }) => formatPkr(row.original.total_amount)
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: [...RECORD_STATUS_OPTIONS],
      type: 'status',
      priority: 1,
      mobile: 'badge'
    },
    enableColumnFilter: true,
    cell: ({ row }) => (
      <span className='inline-flex flex-wrap items-center gap-1'>
        <StatusBadge status={row.original.status} />
        {row.original.is_opening_stock ? (
          <StatusBadge status='OPENING' label='Opening' tone='neutral' />
        ) : null}
      </span>
    )
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    meta: { mobile: 'hidden' },
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

const purchaseMobileItem: MobileItemConfig<PurchaseRow> = {
  leading: 'icon',
  leadingIcon: Icons.receipt,
  title: (row) => row.purchase_no,
  subtitle: (row) => row.supplier_invoice_ref || row.supplier_name || '—',
  badge: (row) => ({ label: formatLabel(row.status), status: row.status }),
  value: (row) => formatPkr(row.total_amount),
  meta: [(row) => row.purchase_date],
  ariaLabel: (row) =>
    `${row.purchase_no}, ${row.supplier_name ?? ''}, ${formatPkr(row.total_amount)}`
};

const purchaseDetail: DetailConfig<PurchaseRow> = {
  mode: 'page',
  href: (row) => `/dashboard/purchases/${row.id}`,
  title: (row) => row.purchase_no,
  badge: (row) => ({ label: formatLabel(row.status), status: row.status }),
  value: (row) => formatPkr(row.total_amount),
  sections: (row) => [
    {
      title: 'Purchase',
      fields: [
        { label: 'No', value: row.purchase_no },
        { label: 'Date', value: row.purchase_date },
        { label: 'Supplier', value: row.supplier_name ?? '—' },
        { label: 'Supplier invoice', value: row.supplier_invoice_ref ?? '—' },
        { label: 'Total', value: formatPkr(row.total_amount) },
        { label: 'Status', value: <StatusBadge status={row.status} /> },
        ...(row.is_opening_stock ? [{ label: 'Type', value: 'Opening stock' as ReactNode }] : [])
      ]
    }
  ]
};

const purchaseQuickFilters: QuickFilterChip[] = [
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

export function PurchasesTable({ toolbarAction }: TableToolbarProps) {
  const router = useRouter();
  const columnIds = ['purchase_no', 'purchase_date', 'supplier_name', 'total_amount', 'status'];
  const { params, filters } = useDukaanListParams(columnIds, 'purchase_no', ['status']);
  const { data } = useSuspenseQuery(purchasesQueryOptions(filters));
  const pageCount = Math.max(1, Math.ceil(data.total / params.perPage));
  const { table } = useDataTable({
    data: data.items,
    columns: purchaseColumns,
    pageCount,
    rowCount: data.total,
    shallow: true,
    debounceMs: 400,
    initialState: {
      pagination: { pageIndex: 0, pageSize: DUKAAN_DEFAULT_PAGE_SIZE }
    }
  });

  return (
    <ResponsiveDataTable
      table={table}
      toolbarAction={toolbarAction}
      mobileItem={purchaseMobileItem}
      detail={{
        ...purchaseDetail,
        actions: (row) => [
          {
            label: t('table.openRecord'),
            onClick: () => router.push(`/dashboard/purchases/${row.id}`)
          }
        ]
      }}
      quickFilters={purchaseQuickFilters}
    />
  );
}

type SaleRow = {
  id: string;
  sale_no: string;
  sale_date: string;
  customer_name?: string;
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
      icon: Icons.search,
      type: 'id',
      primary: true,
      priority: 1,
      mobile: 'title'
    },
    enableColumnFilter: true
  },
  {
    id: 'sale_date',
    accessorKey: 'sale_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
    meta: { label: 'Date', type: 'date', priority: 2, mobile: 'meta' }
  },
  {
    id: 'customer_name',
    accessorKey: 'customer_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Customer' />,
    meta: { label: 'Customer', type: 'text', priority: 2, mobile: 'subtitle' },
    cell: ({ row }) => row.original.customer_name ?? 'Walk-in'
  },
  {
    id: 'total_amount',
    accessorKey: 'total_amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Total' />,
    meta: {
      label: 'Total',
      type: 'money',
      highlight: true,
      priority: 1,
      mobile: 'value'
    },
    cell: ({ row }) => formatPkr(row.original.total_amount)
  },
  {
    id: 'outstanding',
    accessorKey: 'outstanding',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Outstanding' />,
    meta: { label: 'Outstanding', type: 'money', priority: 3, mobile: 'hidden' },
    cell: ({ row }) => formatPkr(row.original.outstanding)
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: [...RECORD_STATUS_OPTIONS],
      type: 'status',
      priority: 1,
      mobile: 'badge'
    },
    enableColumnFilter: true,
    cell: ({ row }) => <StatusBadge status={row.original.status} />
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    meta: { mobile: 'hidden' },
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

const saleMobileItem: MobileItemConfig<SaleRow> = {
  leading: 'icon',
  leadingIcon: Icons.receipt,
  title: (row) => row.sale_no,
  subtitle: (row) => row.customer_name ?? 'Walk-in',
  badge: (row) => ({ label: formatLabel(row.status), status: row.status }),
  value: (row) => formatPkr(row.total_amount),
  meta: [(row) => row.sale_date],
  ariaLabel: (row) =>
    `${row.sale_no}, ${row.customer_name ?? 'Walk-in'}, ${formatPkr(row.total_amount)}`
};

const saleDetail: DetailConfig<SaleRow> = {
  mode: 'page',
  href: (row) => `/dashboard/sales/${row.id}`,
  title: (row) => row.sale_no,
  badge: (row) => ({ label: formatLabel(row.status), status: row.status }),
  value: (row) => formatPkr(row.total_amount),
  sections: (row) => [
    {
      title: 'Sale',
      fields: [
        { label: 'No', value: row.sale_no },
        { label: 'Date', value: row.sale_date },
        { label: 'Customer', value: row.customer_name ?? 'Walk-in' },
        { label: 'Total', value: formatPkr(row.total_amount) },
        { label: 'Outstanding', value: formatPkr(row.outstanding) },
        { label: 'Status', value: <StatusBadge status={row.status} /> }
      ]
    }
  ]
};

const saleQuickFilters: QuickFilterChip[] = [
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

export function SalesTable({ toolbarAction }: TableToolbarProps) {
  const router = useRouter();
  const columnIds = [
    'sale_no',
    'sale_date',
    'customer_name',
    'total_amount',
    'outstanding',
    'status'
  ];
  const { params, filters } = useDukaanListParams(columnIds, 'sale_no', ['status']);
  const { data } = useSuspenseQuery(salesQueryOptions(filters));
  const pageCount = Math.max(1, Math.ceil(data.total / params.perPage));
  const { table } = useDataTable({
    data: data.items,
    columns: saleColumns,
    pageCount,
    rowCount: data.total,
    shallow: true,
    debounceMs: 400,
    initialState: {
      pagination: { pageIndex: 0, pageSize: DUKAAN_DEFAULT_PAGE_SIZE }
    }
  });

  return (
    <ResponsiveDataTable
      table={table}
      toolbarAction={toolbarAction}
      mobileItem={saleMobileItem}
      detail={{
        ...saleDetail,
        actions: (row) => [
          {
            label: t('table.openRecord'),
            onClick: () => router.push(`/dashboard/sales/${row.id}`)
          }
        ]
      }}
      quickFilters={saleQuickFilters}
    />
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
      icon: Icons.search,
      type: 'date',
      priority: 2,
      mobile: 'meta'
    },
    enableColumnFilter: true
  },
  {
    id: 'category_name',
    accessorKey: 'category_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
    meta: {
      label: 'Category',
      type: 'text',
      primary: true,
      priority: 1,
      mobile: 'title'
    },
    cell: ({ row }) => row.original.category_name ?? '—'
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
    meta: {
      label: 'Amount',
      type: 'money',
      highlight: true,
      priority: 1,
      mobile: 'value'
    },
    cell: ({ row }) => formatPkr(row.original.amount)
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
    meta: { label: 'Description', type: 'longtext', priority: 2, mobile: 'subtitle' },
    cell: ({ row }) => row.original.description ?? '—'
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: [...RECORD_STATUS_OPTIONS],
      type: 'status',
      priority: 3,
      mobile: 'badge'
    },
    enableColumnFilter: true,
    cell: ({ row }) => <StatusBadge status={row.original.status} />
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    meta: { mobile: 'hidden' },
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <ExpenseCellAction data={row.original} />
      </div>
    )
  }
];

const expenseMobileItem: MobileItemConfig<ExpenseRow> = {
  title: (row) => row.category_name ?? '—',
  subtitle: (row) => row.description ?? '—',
  badge: (row) => ({ label: formatLabel(row.status), status: row.status }),
  value: (row) => formatPkr(row.amount),
  meta: [(row) => row.expense_date],
  ariaLabel: (row) => `${row.category_name ?? ''}, ${formatPkr(row.amount)}, ${row.expense_date}`
};

const expenseDetail: DetailConfig<ExpenseRow> = {
  mode: 'sheet',
  title: (row) => row.category_name ?? 'Expense',
  badge: (row) => ({ label: formatLabel(row.status), status: row.status }),
  value: (row) => formatPkr(row.amount),
  sections: (row) => [
    {
      title: 'Expense',
      fields: [
        { label: 'Date', value: row.expense_date },
        { label: 'Category', value: row.category_name ?? '—' },
        { label: 'Amount', value: formatPkr(row.amount) },
        { label: 'Description', value: row.description ?? '—' },
        { label: 'Status', value: <StatusBadge status={row.status} /> }
      ]
    }
  ]
};

const expenseQuickFilters: QuickFilterChip[] = [
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

export function ExpensesTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['expense_date', 'category_name', 'amount', 'description', 'status'];
  const { params, filters } = useDukaanListParams(columnIds, 'expense_date', ['status']);
  const { data } = useSuspenseQuery(expensesQueryOptions(filters));
  const { table } = useDukaanTable(data.items, expenseColumns, data.total, params.perPage);
  return (
    <ResponsiveDataTable
      table={table}
      toolbarAction={toolbarAction}
      mobileItem={expenseMobileItem}
      detail={expenseDetail}
      quickFilters={expenseQuickFilters}
    />
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
      icon: Icons.search,
      type: 'text',
      primary: true,
      priority: 1,
      mobile: 'title'
    },
    enableColumnFilter: true
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    meta: { label: 'Status', type: 'boolean', priority: 2, mobile: 'subtitle' },
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.is_active ? 'ACTIVE' : 'INACTIVE'}
        label={row.original.is_active ? 'Active' : 'Inactive'}
      />
    )
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    meta: { mobile: 'hidden' },
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <ExpenseCategoryCellAction data={row.original} />
      </div>
    )
  }
];

const expenseCategoryMobileItem: MobileItemConfig<ExpenseCategoryRow> = {
  title: (row) => row.name,
  subtitle: (row) => (row.is_active ? 'Active' : 'Inactive'),
  ariaLabel: (row) => `${row.name}, ${row.is_active ? 'Active' : 'Inactive'}`
};

const expenseCategoryDetail: DetailConfig<ExpenseCategoryRow> = {
  mode: 'sheet',
  title: (row) => row.name,
  badge: (row) => ({
    label: row.is_active ? 'Active' : 'Inactive',
    status: row.is_active ? 'ACTIVE' : 'INACTIVE'
  }),
  sections: (row) => [
    {
      title: 'Category',
      fields: [
        { label: 'Name', value: row.name },
        {
          label: 'Status',
          value: (
            <StatusBadge
              status={row.is_active ? 'ACTIVE' : 'INACTIVE'}
              label={row.is_active ? 'Active' : 'Inactive'}
            />
          )
        }
      ]
    }
  ]
};

export function ExpenseCategoriesTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['name', 'is_active'];
  const { params, filters } = useDukaanListParams(columnIds);
  const { data } = useSuspenseQuery(expenseCategoriesQueryOptions(filters));
  const { table } = useDukaanTable(data.items, expenseCategoryColumns, data.total, params.perPage);
  return (
    <ResponsiveDataTable
      table={table}
      toolbarAction={toolbarAction}
      mobileItem={expenseCategoryMobileItem}
      detail={expenseCategoryDetail}
    />
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
      icon: Icons.search,
      type: 'date',
      priority: 2,
      mobile: 'meta'
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
      options: [...CASH_TYPE_OPTIONS],
      type: 'text',
      primary: true,
      priority: 1,
      mobile: 'title'
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
      options: [...CASH_DIRECTION_OPTIONS],
      type: 'status',
      priority: 2,
      mobile: 'hidden'
    },
    enableColumnFilter: true,
    cell: ({ row }) => formatLabel(row.original.direction)
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
    meta: {
      label: 'Amount',
      type: 'money',
      highlight: true,
      priority: 1,
      mobile: 'value'
    },
    cell: ({ row }) => formatPkr(row.original.amount)
  },
  {
    id: 'note',
    accessorKey: 'note',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Note' />,
    meta: { label: 'Note', type: 'longtext', priority: 3, mobile: 'subtitle' },
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

const cashMobileItem: MobileItemConfig<CashRow> = {
  title: (row) => formatLabel(row.type),
  subtitle: (row) => row.note ?? '—',
  value: (row) => {
    const prefix = row.direction === 'OUT' ? '-' : '+';
    return `${prefix}${formatPkr(row.amount)}`;
  },
  valueLabel: (row) => formatLabel(row.direction),
  valueClassName: (row) =>
    cn(row.direction === 'IN' ? 'text-[var(--status-success)]' : 'text-destructive'),
  meta: [(row) => formatDateTime(row.created_at)],
  ariaLabel: (row) =>
    `${formatLabel(row.type)}, ${formatLabel(row.direction)}, ${formatPkr(row.amount)}`
};

const cashDetail: DetailConfig<CashRow> = {
  mode: 'sheet',
  title: (row) => formatLabel(row.type),
  badge: (row) =>
    row.is_overdraft
      ? { label: 'Overdraft', status: 'OVERDUE', tone: 'danger' }
      : { label: formatLabel(row.direction), status: row.direction },
  value: (row) => formatPkr(row.amount),
  sections: (row) => [
    {
      title: 'Cash movement',
      fields: [
        { label: 'When', value: formatDateTime(row.created_at) },
        { label: 'Type', value: formatLabel(row.type) },
        { label: 'Direction', value: formatLabel(row.direction) },
        { label: 'Amount', value: formatPkr(row.amount) },
        { label: 'Note', value: row.note ?? '—' },
        ...(row.reverses_movement_id
          ? [{ label: 'Reverses', value: row.reverses_movement_id }]
          : [])
      ]
    }
  ]
};

export function CashTable() {
  const columnIds = ['created_at', 'type', 'direction', 'amount', 'note'];
  const { params, filters } = useDukaanListParams(columnIds, 'created_at', ['type', 'direction']);
  const { data } = useSuspenseQuery(cashQueryOptions(filters));
  const { table } = useDukaanTable(data.items, cashColumns, data.total, params.perPage);
  return (
    <ResponsiveDataTable
      table={table}
      mobileItem={cashMobileItem}
      detail={cashDetail}
      ledger={{ getDateKey: (r) => r.created_at }}
    />
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
      icon: Icons.search,
      type: 'text',
      primary: true,
      priority: 1,
      mobile: 'title'
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
      options: [...TRACKING_TYPE_OPTIONS],
      type: 'text',
      priority: 2,
      mobile: 'subtitle'
    },
    enableColumnFilter: true,
    cell: ({ row }) => <Badge variant='outline'>{formatLabel(row.original.tracking_type)}</Badge>
  },
  {
    id: 'quantity',
    accessorKey: 'quantity',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Qty' />,
    meta: {
      label: 'Qty',
      type: 'number',
      highlight: true,
      priority: 1,
      mobile: 'value'
    }
  },
  {
    id: 'avg_unit_cost',
    accessorKey: 'avg_unit_cost',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Avg cost' />,
    meta: { label: 'Avg cost', type: 'money', priority: 2, mobile: 'meta' },
    cell: ({ row }) => formatPkr(row.original.avg_unit_cost)
  },
  {
    id: 'low_stock',
    accessorKey: 'low_stock',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Alert' />,
    meta: {
      label: 'Alert',
      variant: 'multiSelect',
      options: [...LOW_STOCK_OPTIONS],
      type: 'status',
      priority: 1,
      mobile: 'badge'
    },
    enableColumnFilter: true,
    cell: ({ row }) =>
      row.original.low_stock ? (
        <StatusBadge status='OVERDUE' label='Low' tone='danger' />
      ) : (
        <StatusBadge status='ACTIVE' label='OK' tone='success' />
      )
  }
];

const stockMobileItem: MobileItemConfig<StockRow> = {
  title: (row) => row.product_name,
  subtitle: (row) => formatLabel(row.tracking_type),
  badge: (row) =>
    row.low_stock ? { label: 'Low stock', status: 'OVERDUE', tone: 'danger' } : null,
  value: (row) => String(row.quantity),
  meta: [(row) => formatPkr(row.avg_unit_cost)],
  ariaLabel: (row) => `${row.product_name}, qty ${row.quantity}, ${formatPkr(row.avg_unit_cost)}`
};

const stockDetail: DetailConfig<StockRow> = {
  mode: 'sheet',
  title: (row) => row.product_name,
  badge: (row) =>
    row.low_stock ? { label: 'Low stock', status: 'OVERDUE', tone: 'danger' } : null,
  value: (row) => String(row.quantity),
  sections: (row) => [
    {
      title: 'Stock',
      fields: [
        { label: 'Product', value: row.product_name },
        { label: 'Tracking', value: formatLabel(row.tracking_type) },
        { label: 'Quantity', value: row.quantity },
        { label: 'Avg cost', value: formatPkr(row.avg_unit_cost) },
        {
          label: 'Alert',
          value: row.low_stock ? (
            <StatusBadge status='OVERDUE' label='Low' tone='danger' />
          ) : (
            <StatusBadge status='ACTIVE' label='OK' tone='success' />
          )
        }
      ]
    }
  ]
};

const stockQuickFilters: QuickFilterChip[] = [
  { id: 'all', label: t('table.all') },
  {
    id: 'low',
    label: 'Low stock',
    columnId: 'low_stock',
    value: ['true']
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
    <ResponsiveDataTable
      table={table}
      mobileItem={stockMobileItem}
      detail={stockDetail}
      quickFilters={stockQuickFilters}
    />
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
      icon: Icons.search,
      type: 'date',
      priority: 2,
      mobile: 'meta'
    },
    enableColumnFilter: true
  },
  {
    id: 'supplier_name',
    accessorKey: 'supplier_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Supplier' />,
    meta: {
      label: 'Supplier',
      type: 'text',
      primary: true,
      priority: 1,
      mobile: 'title'
    },
    cell: ({ row }) => row.original.supplier_name ?? '—'
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
    meta: {
      label: 'Amount',
      type: 'money',
      highlight: true,
      priority: 1,
      mobile: 'value'
    },
    cell: ({ row }) => formatPkr(row.original.amount)
  },
  {
    id: 'notes',
    accessorKey: 'notes',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Notes' />,
    meta: { label: 'Notes', type: 'longtext', priority: 3, mobile: 'subtitle' },
    cell: ({ row }) => row.original.notes ?? '—'
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: [...RECORD_STATUS_OPTIONS],
      type: 'status',
      priority: 2,
      mobile: 'badge'
    },
    enableColumnFilter: true,
    cell: ({ row }) => <StatusBadge status={row.original.status} />
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    meta: { mobile: 'hidden' },
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <SupplierPaymentCellAction data={row.original} />
      </div>
    )
  }
];

const supplierPaymentMobileItem: MobileItemConfig<SupplierPaymentRow> = {
  title: (row) => row.supplier_name ?? '—',
  subtitle: (row) => row.notes || formatLabel(row.status),
  badge: (row) => ({ label: formatLabel(row.status), status: row.status }),
  value: (row) => formatPkr(row.amount),
  meta: [(row) => row.payment_date],
  ariaLabel: (row) => `${row.supplier_name ?? ''}, ${formatPkr(row.amount)}, ${row.payment_date}`
};

const supplierPaymentDetail: DetailConfig<SupplierPaymentRow> = {
  mode: 'sheet',
  title: (row) => row.supplier_name ?? 'Payment',
  badge: (row) => ({ label: formatLabel(row.status), status: row.status }),
  value: (row) => formatPkr(row.amount),
  sections: (row) => [
    {
      title: 'Payment',
      fields: [
        { label: 'Date', value: row.payment_date },
        { label: 'Supplier', value: row.supplier_name ?? '—' },
        { label: 'Amount', value: formatPkr(row.amount) },
        { label: 'Notes', value: row.notes ?? '—' },
        { label: 'Status', value: <StatusBadge status={row.status} /> }
      ]
    }
  ]
};

export function SupplierPaymentsTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['payment_date', 'supplier_name', 'amount', 'notes', 'status'];
  const { params, filters } = useDukaanListParams(columnIds, 'payment_date', ['status']);
  const { data } = useSuspenseQuery(supplierPaymentsQueryOptions(filters));
  const { table } = useDukaanTable(data.items, supplierPaymentColumns, data.total, params.perPage);
  return (
    <ResponsiveDataTable
      table={table}
      toolbarAction={toolbarAction}
      mobileItem={supplierPaymentMobileItem}
      detail={supplierPaymentDetail}
    />
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
      icon: Icons.search,
      type: 'date',
      priority: 3,
      mobile: 'hidden'
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
      options: [...MOVEMENT_TYPE_OPTIONS],
      type: 'text',
      priority: 2,
      mobile: 'subtitle'
    },
    enableColumnFilter: true,
    cell: ({ row }) => formatLabel(row.original.type)
  },
  {
    id: 'product_name',
    accessorKey: 'product_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Product' />,
    meta: {
      label: 'Product',
      type: 'text',
      primary: true,
      priority: 1,
      mobile: 'title'
    },
    cell: ({ row }) => row.original.product_name ?? '—'
  },
  {
    id: 'imei1',
    accessorKey: 'imei1',
    header: ({ column }) => <DataTableColumnHeader column={column} title='IMEI1' />,
    meta: { label: 'IMEI1', type: 'id', priority: 3, mobile: 'hidden' },
    cell: ({ row }) => row.original.imei1 ?? '—'
  },
  {
    id: 'quantity_change',
    accessorKey: 'quantity_change',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Qty Δ' />,
    meta: {
      label: 'Qty Δ',
      type: 'number',
      highlight: true,
      priority: 1,
      mobile: 'value'
    },
    cell: ({ row }) => {
      const q = row.original.quantity_change;
      const prefix = q > 0 ? '+' : '';
      return (
        <span
          className={cn(
            q > 0 ? 'text-[var(--status-success)]' : q < 0 ? 'text-destructive' : undefined
          )}
        >
          {prefix}
          {q}
        </span>
      );
    }
  },
  {
    id: 'reason',
    accessorKey: 'reason',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Reason' />,
    meta: { label: 'Reason', type: 'longtext', priority: 2, mobile: 'meta' },
    cell: ({ row }) => row.original.reason ?? '—'
  }
];

const movementMobileItem: MobileItemConfig<MovementRow> = {
  title: (row) => row.product_name ?? '—',
  subtitle: (row) => [formatLabel(row.type), row.imei1].filter(Boolean).join(' · ') || '—',
  value: (row) => {
    const q = row.quantity_change;
    const prefix = q > 0 ? '+' : '';
    return `${prefix}${q}`;
  },
  valueClassName: (row) =>
    cn(
      row.quantity_change > 0
        ? 'text-[var(--status-success)]'
        : row.quantity_change < 0
          ? 'text-destructive'
          : undefined
    ),
  meta: [(row) => row.reason ?? '—'],
  ariaLabel: (row) => `${row.product_name ?? ''}, ${formatLabel(row.type)}, ${row.quantity_change}`
};

const movementDetail: DetailConfig<MovementRow> = {
  mode: 'sheet',
  title: (row) => row.product_name ?? 'Movement',
  value: (row) => {
    const q = row.quantity_change;
    const prefix = q > 0 ? '+' : '';
    return `${prefix}${q}`;
  },
  sections: (row) => [
    {
      title: 'Movement',
      fields: [
        { label: 'When', value: formatDateTime(row.created_at) },
        { label: 'Type', value: formatLabel(row.type) },
        { label: 'Product', value: row.product_name ?? '—' },
        { label: 'IMEI1', value: row.imei1 ?? '—' },
        { label: 'Qty Δ', value: row.quantity_change },
        { label: 'Reason', value: row.reason ?? '—' }
      ]
    }
  ]
};

export function MovementsTable() {
  const columnIds = ['created_at', 'type', 'product_name', 'imei1', 'quantity_change', 'reason'];
  const { params, filters } = useDukaanListParams(columnIds, 'created_at', ['type']);
  const { data } = useSuspenseQuery(inventoryMovementsQueryOptions(filters));
  const { table } = useDukaanTable(data.items, movementColumns, data.total, params.perPage);
  return (
    <ResponsiveDataTable
      table={table}
      mobileItem={movementMobileItem}
      detail={movementDetail}
      ledger={{ getDateKey: (r) => r.created_at }}
    />
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
      icon: Icons.search,
      type: 'date',
      priority: 2,
      mobile: 'meta'
    },
    enableColumnFilter: true
  },
  {
    id: 'customer_name',
    accessorKey: 'customer_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Customer' />,
    meta: {
      label: 'Customer',
      type: 'text',
      primary: true,
      priority: 1,
      mobile: 'title'
    },
    cell: ({ row }) => row.original.customer_name ?? 'Walk-in'
  },
  {
    id: 'sale_no',
    accessorKey: 'sale_no',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Sale' />,
    meta: { label: 'Sale', type: 'id', priority: 3, mobile: 'hidden' },
    cell: ({ row }) => row.original.sale_no ?? '—'
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
    meta: {
      label: 'Amount',
      type: 'money',
      highlight: true,
      priority: 1,
      mobile: 'value'
    },
    cell: ({ row }) => (
      <span className='text-[var(--status-success)]'>{formatPkr(row.original.amount)}</span>
    )
  },
  {
    id: 'method',
    accessorKey: 'method',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Method' />,
    meta: {
      label: 'Method',
      variant: 'multiSelect',
      options: [...PAYMENT_METHOD_OPTIONS],
      type: 'text',
      priority: 2,
      mobile: 'subtitle'
    },
    enableColumnFilter: true,
    cell: ({ row }) => formatLabel(row.original.method)
  },
  {
    id: 'receipt_group_id',
    accessorKey: 'receipt_group_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Receipt group' />,
    meta: { label: 'Receipt group', type: 'id', priority: 4, mobile: 'hidden' },
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
      options: [...RECORD_STATUS_OPTIONS],
      type: 'status',
      priority: 3,
      mobile: 'hidden'
    },
    enableColumnFilter: true,
    cell: ({ row }) => <StatusBadge status={row.original.status} />
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    meta: { mobile: 'hidden' },
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <PaymentCellAction data={row.original} />
      </div>
    )
  }
];

const paymentMobileItem: MobileItemConfig<PaymentRow> = {
  title: (row) => row.customer_name ?? 'Walk-in',
  subtitle: (row) => formatLabel(row.method),
  value: (row) => formatPkr(row.amount),
  valueClassName: () => 'text-[var(--status-success)]',
  meta: [(row) => formatDateTime(row.created_at)],
  ariaLabel: (row) =>
    `${row.customer_name ?? 'Walk-in'}, ${formatLabel(row.method)}, ${formatPkr(row.amount)}`
};

const paymentDetail: DetailConfig<PaymentRow> = {
  mode: 'sheet',
  title: (row) => row.customer_name ?? 'Walk-in',
  value: (row) => <span className='text-[var(--status-success)]'>{formatPkr(row.amount)}</span>,
  sections: (row) => [
    {
      title: 'Payment',
      fields: [
        { label: 'When', value: formatDateTime(row.created_at) },
        { label: 'Customer', value: row.customer_name ?? 'Walk-in' },
        { label: 'Sale', value: row.sale_no ?? '—' },
        { label: 'Amount', value: formatPkr(row.amount) },
        { label: 'Method', value: formatLabel(row.method) },
        {
          label: 'Receipt group',
          value: <span className='font-mono text-xs'>{row.receipt_group_id.slice(0, 12)}…</span>
        },
        { label: 'Status', value: <StatusBadge status={row.status} /> }
      ]
    }
  ]
};

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
    <ResponsiveDataTable table={table} mobileItem={paymentMobileItem} detail={paymentDetail} />
  );
}
