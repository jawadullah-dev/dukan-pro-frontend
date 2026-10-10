'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveDataTable,
  StatusBadge,
  type DetailConfig,
  type MobileItemConfig
} from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { useT } from '@/i18n/use-t';
import { t } from '@/i18n';
import { formatLabel, formatPkr } from '@/lib/dukaan/numbers';
import type { Brand, Category, Product } from '@/lib/dukaan/types';
import {
  brandsQueryOptions,
  categoriesQueryOptions,
  productsQueryOptions
} from '@/features/dukaan/api/queries';
import { ACTIVE_STATUS_OPTIONS, TRACKING_TYPE_OPTIONS } from '@/features/dukaan/constants/filters';
import {
  BrandCellAction,
  CategoryCellAction,
  ProductCellAction
} from '@/features/dukaan/components/catalog-cell-actions';
import { DUKAAN_DEFAULT_PAGE_SIZE, useDukaanListParams } from '@/components/data-table/list-params';

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
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('table.col.name')} />;
    },
    meta: {
      label: 'table.col.name',
      placeholderKey: 'search.categories' as const,
      variant: 'text',
      icon: Icons.search,
      type: 'text',
      primary: true,
      priority: 1
    },
    enableColumnFilter: true
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('table.col.status')} />;
    },
    meta: { label: 'table.col.status', type: 'boolean', priority: 2 },
    cell: ({ row }) => {
      const t = useT();
      return (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? t('status.active') : t('status.inactive')}
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    meta: { mobile: 'hidden' },
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <CategoryCellAction data={row.original} />
      </div>
    )
  }
];

const categoryMobileItem: MobileItemConfig<Category> = {
  leading: 'icon',
  leadingIcon: Icons.folder,
  title: (row) => row.name,
  subtitle: (row) => (row.is_active ? t('status.active') : t('status.inactive')),
  ariaLabel: (row) => `${row.name}, ${row.is_active ? t('status.active') : t('status.inactive')}`
};

const categoryDetail: DetailConfig<Category> = {
  mode: 'sheet',
  title: (row) => row.name,
  badge: (row) => ({
    label: row.is_active ? t('status.active') : t('status.inactive'),
    status: row.is_active ? 'ACTIVE' : 'INACTIVE'
  }),
  sections: (row) => [
    {
      title: t('table.col.category'),
      fields: [
        { label: t('table.col.name'), value: row.name },
        {
          label: t('table.col.status'),
          value: (
            <StatusBadge
              status={row.is_active ? 'ACTIVE' : 'INACTIVE'}
              label={row.is_active ? t('status.active') : t('status.inactive')}
            />
          )
        }
      ]
    }
  ]
};

export function CategoriesTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['name', 'is_active'];
  const { params, filters } = useDukaanListParams(columnIds);
  const { data } = useSuspenseQuery(categoriesQueryOptions(filters));
  const { table } = useDukaanTable(data.items, categoryColumns, data.total, params.perPage);

  return (
    <ResponsiveDataTable
      table={table}
      toolbarAction={toolbarAction}
      mobileItem={categoryMobileItem}
      detail={categoryDetail}
    />
  );
}

const brandColumns: ColumnDef<Brand>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('table.col.name')} />;
    },
    meta: {
      label: 'table.col.name',
      placeholderKey: 'search.brands' as const,
      variant: 'text',
      icon: Icons.search,
      type: 'text',
      primary: true,
      priority: 1
    },
    enableColumnFilter: true
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('table.col.status')} />;
    },
    meta: { label: 'table.col.status', type: 'boolean', priority: 2 },
    cell: ({ row }) => {
      const t = useT();
      return (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? t('status.active') : t('status.inactive')}
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    meta: { mobile: 'hidden' },
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <BrandCellAction data={row.original} />
      </div>
    )
  }
];

const brandMobileItem: MobileItemConfig<Brand> = {
  leading: 'icon',
  leadingIcon: Icons.tag,
  title: (row) => row.name,
  subtitle: (row) => (row.is_active ? t('status.active') : t('status.inactive')),
  ariaLabel: (row) => `${row.name}, ${row.is_active ? t('status.active') : t('status.inactive')}`
};

const brandDetail: DetailConfig<Brand> = {
  mode: 'sheet',
  title: (row) => row.name,
  badge: (row) => ({
    label: row.is_active ? t('status.active') : t('status.inactive'),
    status: row.is_active ? 'ACTIVE' : 'INACTIVE'
  }),
  sections: (row) => [
    {
      title: t('table.col.brand'),
      fields: [
        { label: t('table.col.name'), value: row.name },
        {
          label: t('table.col.status'),
          value: (
            <StatusBadge
              status={row.is_active ? 'ACTIVE' : 'INACTIVE'}
              label={row.is_active ? t('status.active') : t('status.inactive')}
            />
          )
        }
      ]
    }
  ]
};

export function BrandsTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['name', 'is_active'];
  const { params, filters } = useDukaanListParams(columnIds);
  const { data } = useSuspenseQuery(brandsQueryOptions(filters));
  const { table } = useDukaanTable(data.items, brandColumns, data.total, params.perPage);

  return (
    <ResponsiveDataTable
      table={table}
      toolbarAction={toolbarAction}
      mobileItem={brandMobileItem}
      detail={brandDetail}
    />
  );
}

const productColumns: ColumnDef<Product>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('table.col.name')} />;
    },
    meta: {
      label: 'table.col.name',
      placeholderKey: 'search.products' as const,
      variant: 'text',
      icon: Icons.search,
      type: 'text',
      primary: true,
      priority: 1
    },
    enableColumnFilter: true
  },
  {
    id: 'tracking_type',
    accessorKey: 'tracking_type',
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('dukaan.product.trackingType')} />;
    },
    meta: {
      label: 'dukaan.product.trackingType',
      variant: 'multiSelect',
      options: [...TRACKING_TYPE_OPTIONS],
      type: 'text',
      priority: 2
    },
    enableColumnFilter: true,
    cell: ({ row }) => <Badge variant='outline'>{formatLabel(row.original.tracking_type)}</Badge>
  },
  {
    id: 'default_selling_price',
    accessorKey: 'default_selling_price',
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('table.col.sellPrice')} />;
    },
    meta: {
      label: 'table.col.sellPrice',
      type: 'money',
      highlight: true,
      priority: 1
    },
    cell: ({ row }) => formatPkr(row.original.default_selling_price)
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('table.col.status')} />;
    },
    meta: {
      label: 'table.col.status',
      variant: 'multiSelect',
      options: [...ACTIVE_STATUS_OPTIONS],
      type: 'status',
      priority: 1
    },
    enableColumnFilter: true,
    cell: ({ row }) => {
      const t = useT();
      return (
        <StatusBadge
          status={row.original.is_active ? 'ACTIVE' : 'INACTIVE'}
          label={row.original.is_active ? t('status.active') : t('status.inactive')}
        />
      );
    }
  },
  {
    id: 'actions',
    size: 48,
    enableSorting: false,
    enableHiding: false,
    meta: { mobile: 'hidden' },
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <ProductCellAction data={row.original} />
      </div>
    )
  }
];

const productMobileItem: MobileItemConfig<Product> = {
  leading: 'icon',
  leadingIcon: Icons.box,
  title: (row) => row.name,
  subtitle: (row) => formatLabel(row.tracking_type),
  badge: (row) => ({
    label: row.is_active ? t('status.active') : t('status.inactive'),
    status: row.is_active ? 'ACTIVE' : 'INACTIVE'
  }),
  value: (row) => formatPkr(row.default_selling_price),
  ariaLabel: (row) =>
    `${row.name}, ${formatLabel(row.tracking_type)}, ${formatPkr(row.default_selling_price)}`
};

const productDetail: DetailConfig<Product> = {
  mode: 'sheet',
  title: (row) => row.name,
  badge: (row) => ({
    label: row.is_active ? t('status.active') : t('status.inactive'),
    status: row.is_active ? 'ACTIVE' : 'INACTIVE'
  }),
  value: (row) => formatPkr(row.default_selling_price),
  sections: (row) => [
    {
      title: t('table.col.product'),
      fields: [
        { label: t('table.col.name'), value: row.name },
        { label: t('dukaan.product.trackingType'), value: formatLabel(row.tracking_type) },
        { label: t('table.col.sellPrice'), value: formatPkr(row.default_selling_price) },
        {
          label: t('table.col.status'),
          value: (
            <StatusBadge
              status={row.is_active ? 'ACTIVE' : 'INACTIVE'}
              label={row.is_active ? t('status.active') : t('status.inactive')}
            />
          )
        }
      ]
    }
  ]
};

export function ProductsTable({ toolbarAction }: TableToolbarProps) {
  const columnIds = ['name', 'tracking_type', 'default_selling_price', 'is_active'];
  const { params, filters } = useDukaanListParams(columnIds, 'name', [
    'tracking_type',
    'is_active'
  ]);
  const { data } = useSuspenseQuery(productsQueryOptions(filters));
  const { table } = useDukaanTable(data.items, productColumns, data.total, params.perPage);

  return (
    <ResponsiveDataTable
      table={table}
      toolbarAction={toolbarAction}
      mobileItem={productMobileItem}
      detail={productDetail}
    />
  );
}
