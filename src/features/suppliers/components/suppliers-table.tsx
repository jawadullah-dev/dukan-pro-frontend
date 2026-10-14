'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { RowActionsMenu } from '@/components/common/row-actions-menu';
import {
  ResponsiveDataTable,
  StatusBadge,
  type DetailConfig,
  type MobileItemConfig,
  type QuickFilterChip
} from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useDataTable } from '@/hooks/use-data-table';
import { Icons } from '@/components/icons';
import { useT } from '@/i18n/use-t';
import { t } from '@/i18n';
import { AlertModal } from '@/components/modal/alert-modal';
import {
  DUKAAN_DEFAULT_PAGE_SIZE,
  parseBooleanFacet,
  useDukaanListParams
} from '@/components/data-table/list-params';
import { formatPkr } from '@/lib/dukaan/numbers';
import { formatDate } from '@/lib/format';
import type { SupplierDTO } from '@/lib/api/types';
import { supplierKeys, suppliersQueryOptions } from '../api/queries';
import { deactivateSupplier, reactivateSupplier } from '../api/service';
import type { SupplierListFilters } from '@/types';
import { SupplierDialog } from './supplier-dialog';
import type { SupplierCellActionProps, SuppliersTableProps } from '@/types/suppliers';

function SupplierCellAction({ data }: SupplierCellActionProps) {
  const t = useT();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const deactivate = useMutation({
    mutationFn: () => deactivateSupplier(data.id),
    onSuccess: () => {
      toast.success(t('dukaan.party.supplierDeactivated'));
      setDeactivateOpen(false);
      void qc.invalidateQueries({ queryKey: supplierKeys.all });
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const activate = useMutation({
    mutationFn: () => reactivateSupplier(data.id),
    onSuccess: () => {
      toast.success(t('dukaan.party.supplierActivated'));
      void qc.invalidateQueries({ queryKey: supplierKeys.all });
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role='presentation'
      data-slot='action-cell'
    >
      <AlertModal
        isOpen={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={() => deactivate.mutate()}
        loading={deactivate.isPending}
        title={t('dukaan.party.supplierDeactivateTitle')}
        description={t('dukaan.party.supplierDeactivateDescription')}
        confirmLabel={t('common.deactivate')}
      />
      <SupplierDialog open={editOpen} onOpenChange={setEditOpen} supplier={data} />
      <RowActionsMenu
        actions={[
          {
            label: t('common.edit'),
            icon: Icons.edit,
            onClick: () => setEditOpen(true)
          },
          ...(!data.isSystem && data.isActive
            ? [
                {
                  label: t('common.deactivate'),
                  icon: Icons.trash,
                  className: 'text-amber-600 focus:text-amber-700 dark:text-amber-400',
                  onClick: () => setDeactivateOpen(true)
                }
              ]
            : []),
          ...(!data.isSystem && !data.isActive
            ? [
                {
                  label: t('common.activate'),
                  icon: Icons.check,
                  className: 'text-emerald-600 focus:text-emerald-700 dark:text-emerald-400',
                  disabled: activate.isPending,
                  onClick: () => activate.mutate()
                }
              ]
            : [])
        ]}
      />
    </div>
  );
}

const supplierColumns: ColumnDef<SupplierDTO>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.name')} />,
    meta: {
      label: 'table.col.name',
      placeholderKey: 'search.suppliers' as const,
      variant: 'text',
      icon: Icons.search,
      type: 'text',
      primary: true,
      priority: 1,
      mobile: 'title'
    },
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <span className='font-medium'>{row.original.name}</span>
        {row.original.isSystem && (
          <Badge variant='outline' className='text-[10px] uppercase font-semibold'>
            {t('common.system')}
          </Badge>
        )}
      </div>
    )
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    size: 160,
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.phone')} />,
    meta: { label: 'table.col.phone', type: 'phone', priority: 2, mobile: 'subtitle' },
    enableSorting: true,
    cell: ({ row }) => row.original.phone || '—'
  },
  {
    id: 'openingBalance',
    accessorKey: 'openingBalance',
    size: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('dukaan.party.supplierOpeningBalance')} />
    ),
    meta: {
      label: 'dukaan.party.supplierOpeningBalance',
      type: 'money',
      priority: 2,
      mobile: 'value'
    },
    enableSorting: true,
    cell: ({ row }) => formatPkr(row.original.openingBalance)
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    size: 140,
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.date')} />,
    meta: {
      label: 'table.col.date',
      type: 'date',
      priority: 3,
      mobile: 'hidden'
    },
    enableSorting: true,
    cell: ({ row }) =>
      formatDate(row.original.createdAt, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    size: 110,
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.status')} />,
    meta: {
      label: 'table.col.status',
      variant: 'select',
      options: [
        {
          get label() {
            return t('status.active');
          },
          value: 'true'
        },
        {
          get label() {
            return t('status.inactive');
          },
          value: 'false'
        }
      ],
      type: 'boolean',
      priority: 4,
      mobile: 'badge'
    },
    enableColumnFilter: true,
    enableSorting: false,
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
        {row.original.isActive ? t('status.active') : t('status.inactive')}
      </Badge>
    )
  },
  {
    id: 'actions',
    size: 72,
    header: () => (
      <span className='h-8 inline-flex items-center text-xs font-medium text-foreground'>
        {t('table.actions')}
      </span>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { mobile: 'hidden' },
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <SupplierCellAction data={row.original} />
      </div>
    )
  }
];

const supplierMobileItem: MobileItemConfig<SupplierDTO> = {
  leading: 'avatar',
  title: (row) => row.name,
  subtitle: (row) => row.phone ?? undefined,
  badge: (row) => ({
    label: row.isActive ? t('status.active') : t('status.inactive'),
    status: row.isActive ? 'ACTIVE' : 'INACTIVE'
  }),
  value: (row) => formatPkr(row.openingBalance),
  valueLabel: () => t('dukaan.party.supplierOpeningBalance'),
  ariaLabel: (row) => `${row.name}, ${row.phone ?? ''}, ${row.isActive ? 'Active' : 'Inactive'}`
};

const supplierDetail: DetailConfig<SupplierDTO> = {
  mode: 'sheet',
  title: (row) => row.name,
  badge: (row) => ({
    label: row.isActive ? t('status.active') : t('status.inactive'),
    status: row.isActive ? 'ACTIVE' : 'INACTIVE'
  }),
  value: (row) => formatPkr(row.openingBalance),
  sections: (row) => [
    {
      title: t('table.col.supplier'),
      fields: [
        { label: t('table.col.name'), value: row.name },
        {
          label: t('table.col.phone'),
          value: row.phone ? (
            <a
              className='text-primary underline-offset-2 hover:underline'
              href={`tel:${row.phone}`}
            >
              {row.phone}
            </a>
          ) : (
            '—'
          )
        },
        {
          label: t('table.col.status'),
          value: (
            <StatusBadge
              status={row.isActive ? 'ACTIVE' : 'INACTIVE'}
              label={row.isActive ? t('status.active') : t('status.inactive')}
            />
          )
        },
        {
          label: t('table.col.date'),
          value: formatDate(row.createdAt, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        },
        { label: t('table.address'), value: row.address ?? '—' },
        { label: t('table.col.note'), value: row.notes ?? '—' }
      ]
    },
    {
      title: t('table.balance'),
      fields: [
        {
          label: t('dukaan.party.supplierOpeningBalance'),
          value: formatPkr(row.openingBalance)
        }
      ]
    }
  ]
};

export function SuppliersTable({ toolbarAction }: SuppliersTableProps) {
  const t = useT();

  const sortableColumnIds = ['name', 'phone', 'openingBalance', 'createdAt'];
  const { params, sortBy, sortOrder, getPageCount } = useDukaanListParams<
    SupplierListFilters['sortBy']
  >(sortableColumnIds, 'name', ['isActive'], 'createdAt');

  const [nameParam] = useQueryState('name', parseAsString);
  const [searchParam] = useQueryState('search', parseAsString);
  const [isActiveParam] = useQueryState('isActive', parseAsString);

  const search = searchParam || nameParam || undefined;
  const isActiveFilter = parseBooleanFacet(isActiveParam);

  const { data, isLoading, isFetching } = useQuery(
    suppliersQueryOptions({
      page: params.page,
      pageSize: params.perPage,
      search: search || undefined,
      isActive: isActiveFilter,
      sortBy,
      sortOrder
    })
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = getPageCount(total);

  const { table } = useDataTable({
    data: items,
    columns: supplierColumns,
    pageCount,
    rowCount: total,
    shallow: true,
    debounceMs: 400,
    initialState: {
      pagination: { pageIndex: 0, pageSize: DUKAAN_DEFAULT_PAGE_SIZE }
    }
  });

  const supplierQuickFilters: QuickFilterChip[] = [
    { id: 'all', label: t('table.all') },
    {
      id: 'active',
      label: t('status.active'),
      columnId: 'isActive',
      value: ['true']
    },
    {
      id: 'inactive',
      label: t('status.inactive'),
      columnId: 'isActive',
      value: ['false']
    }
  ];

  return (
    <ResponsiveDataTable
      table={table}
      toolbarAction={toolbarAction}
      mobileItem={supplierMobileItem}
      detail={supplierDetail}
      quickFilters={supplierQuickFilters}
      isLoading={isLoading || isFetching}
      rowCount={items.length > 0 ? items.length : total > 0 ? total : undefined}
    />
  );
}
