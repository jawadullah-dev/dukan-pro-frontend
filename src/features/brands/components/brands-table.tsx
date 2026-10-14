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
import { t } from '@/i18n';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { brandsQueryOptions, brandKeys } from '../api/queries';
import { deleteBrand } from '../api/service';
import type { BrandDTO } from '@/lib/api/types';
import type { BrandCellActionProps, BrandsTableProps } from '@/types';
import { DUKAAN_DEFAULT_PAGE_SIZE, useDukaanListParams } from '@/components/data-table/list-params';
import { BrandDialog } from './brand-dialog';

function BrandCellAction({ data }: BrandCellActionProps) {
  const t = useT();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () => deleteBrand(data.id),
    onSuccess: () => {
      toast.success(t('dukaan.brand.deleted'));
      setDeleteOpen(false);
      void qc.invalidateQueries({ queryKey: brandKeys.all });
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
        title={t('dukaan.brand.deleteTitle')}
        description={t('dukaan.brand.deleteDescription')}
        confirmLabel={t('common.delete')}
      />
      <BrandDialog open={editOpen} onOpenChange={setEditOpen} brand={data} />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
          <span className='sr-only'>{t('common.openMenu')}</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
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

const brandColumns: ColumnDef<BrandDTO>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.name')} />,
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
    id: 'isActive',
    accessorKey: 'isActive',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.status')} />,
    meta: { label: 'table.col.status', type: 'boolean', priority: 2 },
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
        {row.original.isActive ? t('status.active') : t('status.inactive')}
      </Badge>
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
        <BrandCellAction data={row.original} />
      </div>
    )
  }
];

const brandMobileItem: MobileItemConfig<BrandDTO> = {
  leading: 'icon',
  leadingIcon: Icons.tag,
  title: (row) => row.name,
  subtitle: (row) => (row.isActive ? t('status.active') : t('status.inactive')),
  ariaLabel: (row) => `${row.name}, ${row.isActive ? t('status.active') : t('status.inactive')}`
};

const brandDetail: DetailConfig<BrandDTO> = {
  mode: 'sheet',
  title: (row) => row.name,
  badge: (row) => ({
    label: row.isActive ? t('status.active') : t('status.inactive'),
    status: row.isActive ? 'ACTIVE' : 'INACTIVE'
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
              status={row.isActive ? 'ACTIVE' : 'INACTIVE'}
              label={row.isActive ? t('status.active') : t('status.inactive')}
            />
          )
        }
      ]
    }
  ]
};

export function BrandsTable({ toolbarAction }: BrandsTableProps) {
  const columnIds = ['name', 'isActive'];
  const { params, filters } = useDukaanListParams(columnIds);
  const { data } = useSuspenseQuery(
    brandsQueryOptions({ page: params.page, pageSize: params.perPage, search: filters.search })
  );
  const pageCount = Math.max(1, Math.ceil(data.total / params.perPage));
  const { table } = useDataTable({
    data: data.items,
    columns: brandColumns,
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
      mobileItem={brandMobileItem}
      detail={brandDetail}
    />
  );
}
