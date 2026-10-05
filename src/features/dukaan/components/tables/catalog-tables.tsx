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
import { formatLabel, formatPkr } from '@/lib/dukaan/numbers';
import type { Brand, Category, Product } from '@/lib/dukaan/types';
import {
  brandsQueryOptions,
  categoriesQueryOptions,
  productsQueryOptions
} from '../../api/queries';
import { ACTIVE_STATUS_OPTIONS, TRACKING_TYPE_OPTIONS } from '../../constants/filters';
import { BrandCellAction, CategoryCellAction, ProductCellAction } from '../catalog-cell-actions';
import { DUKAAN_DEFAULT_PAGE_SIZE, useDukaanListParams } from './list-params';

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

interface TableToolbarProps {
  toolbarAction?: ReactNode;
}

const categoryColumns: ColumnDef<Category>[] = [
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
        <CategoryCellAction data={row.original} />
      </div>
    )
  }
];

export function CategoriesTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['name', 'is_active'];
  const { params, filters } = useDukaanListParams(columnIds);
  const { data } = useSuspenseQuery(categoriesQueryOptions(filters));
  const { table } = useDukaanTable(data.items, categoryColumns, data.total, params.perPage);

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>{toolbarAction}</DataTableToolbar>
    </DataTable>
  );
}

const brandColumns: ColumnDef<Brand>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
    meta: {
      label: 'Name',
      placeholder: 'Search brands...',
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
        <BrandCellAction data={row.original} />
      </div>
    )
  }
];

export function BrandsTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['name', 'is_active'];
  const { params, filters } = useDukaanListParams(columnIds);
  const { data } = useSuspenseQuery(brandsQueryOptions(filters));
  const { table } = useDukaanTable(data.items, brandColumns, data.total, params.perPage);

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>{toolbarAction}</DataTableToolbar>
    </DataTable>
  );
}

const productColumns: ColumnDef<Product>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
    meta: {
      label: 'Name',
      placeholder: 'Search products...',
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
    id: 'default_selling_price',
    accessorKey: 'default_selling_price',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Sell price' />,
    meta: { label: 'Sell price' },
    cell: ({ row }) => formatPkr(row.original.default_selling_price)
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: [...ACTIVE_STATUS_OPTIONS]
    },
    enableColumnFilter: true,
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
        <ProductCellAction data={row.original} />
      </div>
    )
  }
];

export function ProductsTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['name', 'tracking_type', 'default_selling_price', 'is_active'];
  const { params, filters } = useDukaanListParams(columnIds, 'name', [
    'tracking_type',
    'is_active'
  ]);
  const { data } = useSuspenseQuery(productsQueryOptions(filters));
  const { table } = useDukaanTable(data.items, productColumns, data.total, params.perPage);

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>{toolbarAction}</DataTableToolbar>
    </DataTable>
  );
}
