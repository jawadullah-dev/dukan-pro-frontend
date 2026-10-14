'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
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
import { t as staticT } from '@/i18n/static-t';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { productsQueryOptions, productsQueryKeys } from '../api/queries';
import { deleteProduct } from '../api/service';
import type { ProductDTO } from '@/lib/api/types';
import { formatPkr } from '@/lib/dukaan/numbers';
import { DUKAAN_DEFAULT_PAGE_SIZE, useDukaanListParams } from '@/components/data-table/list-params';
import { ProductDialog } from './product-dialog';
import type { ProductCellActionProps, ProductsTableProps } from '@/types/products';

function ProductCellAction({ data }: ProductCellActionProps) {
  const t = useT();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () => deleteProduct(data.id),
    onSuccess: () => {
      toast.success(t('dukaan.product.deleted'));
      setDeleteOpen(false);
      void qc.invalidateQueries({ queryKey: productsQueryKeys.all });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => remove.mutate()}
        loading={remove.isPending}
        title={t('dukaan.product.deleteTitle')}
        description={t('dukaan.product.deleteDescription')}
        confirmLabel={t('common.delete')}
      />
      <ProductDialog open={editOpen} onOpenChange={setEditOpen} product={data} />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          render={<Button type='button' variant='ghost' className='h-8 w-8 p-0' />}
        >
          <span className='sr-only'>{t('common.openMenu')}</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => requestAnimationFrame(() => setEditOpen(true))}>
              <Icons.edit className='me-2 h-4 w-4' /> {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => requestAnimationFrame(() => setDeleteOpen(true))}>
              <Icons.trash className='me-2 h-4 w-4' /> {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

const productColumns: ColumnDef<ProductDTO>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={staticT('table.col.name')} />
    ),
    meta: {
      label: 'table.col.name',
      placeholderKey: 'table.search' as const,
      variant: 'text',
      icon: Icons.search,
      type: 'text',
      primary: true,
      priority: 1
    },
    enableColumnFilter: true,
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>{row.original.name}</span>
        <span className='text-xs text-muted-foreground'>
          {row.original.sku ? `SKU: ${row.original.sku}` : row.original.brandName || ''}
        </span>
      </div>
    )
  },
  {
    id: 'categoryName',
    accessorKey: 'categoryName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={staticT('dukaan.product.category')} />
    ),
    meta: { label: 'dukaan.product.category', type: 'text', priority: 2 },
    cell: ({ row }) => <span>{row.original.categoryName || '—'}</span>
  },
  {
    id: 'brandName',
    accessorKey: 'brandName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={staticT('dukaan.product.brand')} />
    ),
    meta: { label: 'dukaan.product.brand', type: 'text', priority: 3 },
    cell: ({ row }) => <span>{row.original.brandName || '—'}</span>
  },
  {
    id: 'defaultSellingPrice',
    accessorKey: 'defaultSellingPrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={staticT('dukaan.product.sellingPrice')} />
    ),
    meta: { label: 'dukaan.product.sellingPrice', type: 'money', priority: 2 },
    cell: ({ row }) => formatPkr(row.original.defaultSellingPrice)
  },
  {
    id: 'quantityOnHand',
    accessorKey: 'quantityOnHand',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={staticT('dukaan.product.stock')} />
    ),
    meta: { label: 'dukaan.product.stock', type: 'number', priority: 2 },
    cell: ({ row }) => <span>{row.original.quantityOnHand ?? 0}</span>
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={staticT('table.col.status')} />
    ),
    meta: { label: 'table.col.status', type: 'boolean', priority: 2 },
    cell: ({ row }) => (
      <div className='flex flex-col gap-1'>
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? staticT('status.active') : staticT('status.inactive')}
        </Badge>
        <span className='text-[10px] text-muted-foreground'>
          {row.original.isPublished
            ? staticT('dukaan.product.published')
            : staticT('dukaan.product.unpublished')}
        </span>
      </div>
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
        <ProductCellAction data={row.original} />
      </div>
    )
  }
];

const productMobileItem: MobileItemConfig<ProductDTO> = {
  leading: 'icon',
  leadingIcon: Icons.product,
  title: (row) => row.name,
  subtitle: (row) => row.categoryName || (row.isActive ? 'Active' : 'Inactive'),
  badge: (row) => ({
    label: row.isActive ? 'Active' : 'Inactive',
    status: row.isActive ? 'ACTIVE' : 'INACTIVE'
  }),
  value: (row) => formatPkr(row.defaultSellingPrice),
  ariaLabel: (row) => `${row.name}, ${row.isActive ? 'Active' : 'Inactive'}`
};

const productDetail: DetailConfig<ProductDTO> = {
  mode: 'sheet',
  title: (row) => row.name,
  badge: (row) => ({
    label: row.isActive ? 'Active' : 'Inactive',
    status: row.isActive ? 'ACTIVE' : 'INACTIVE'
  }),
  value: (row) => formatPkr(row.defaultSellingPrice),
  sections: (row) => [
    {
      title: 'Product Details',
      fields: [
        { label: 'Name', value: row.name },
        { label: 'Category', value: row.categoryName || '—' },
        { label: 'Brand', value: row.brandName || '—' },
        { label: 'Selling Price', value: formatPkr(row.defaultSellingPrice) },
        { label: 'Stock', value: String(row.quantityOnHand ?? 0) },
        {
          label: 'Status',
          value: (
            <StatusBadge
              status={row.isActive ? 'ACTIVE' : 'INACTIVE'}
              label={row.isActive ? 'Active' : 'Inactive'}
            />
          )
        }
      ]
    }
  ]
};

export function ProductsTable({ toolbarAction }: ProductsTableProps) {
  const columnIds = ['name', 'categoryName', 'brandName', 'isActive'];
  const { params, filters } = useDukaanListParams(columnIds);
  const { data } = useSuspenseQuery(
    productsQueryOptions({ page: params.page, pageSize: params.perPage, search: filters.search })
  );
  const pageCount = Math.max(1, Math.ceil(data.total / params.perPage));
  const { table } = useDataTable({
    data: data.items,
    columns: productColumns,
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
      mobileItem={productMobileItem}
      detail={productDetail}
    />
  );
}
