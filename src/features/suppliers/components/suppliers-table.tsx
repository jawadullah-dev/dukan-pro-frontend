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
  type DetailConfig,
  type MobileItemConfig
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
import type { SupplierDTO } from '@/lib/api/types';
import { supplierKeys, suppliersQueryOptions } from '../api/queries';
import { deactivateSupplier, reactivateSupplier } from '../api/service';
import type { SupplierListFilters } from '@/types';
import { SupplierDialog } from './supplier-dialog';
import type { SupplierCellActionProps, SuppliersTableProps } from '@/types/suppliers';
import {
  createPartyPhoneColumn,
  createPartyCreatedAtColumn,
  createPartyIsActiveColumn,
  PartyActionsHeader,
  buildPartyMobileItem,
  buildPartyDetail,
  getActiveStatusQuickFilters
} from '@/components/common/party-table-helpers';

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
  createPartyPhoneColumn<SupplierDTO>(),
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
  createPartyCreatedAtColumn<SupplierDTO>(),
  createPartyIsActiveColumn<SupplierDTO>(),
  {
    id: 'actions',
    size: 72,
    header: PartyActionsHeader,
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

const supplierMobileItem: MobileItemConfig<SupplierDTO> = buildPartyMobileItem<SupplierDTO>(() =>
  t('dukaan.party.supplierOpeningBalance')
);

const supplierDetail: DetailConfig<SupplierDTO> = buildPartyDetail<SupplierDTO>({
  partyName: t('dukaan.party.name'),
  balance: t('table.balance'),
  openingBalance: t('dukaan.party.supplierOpeningBalance')
});

export function SuppliersTable({ toolbarAction }: SuppliersTableProps) {
  const t = useT();

  const sortableColumnIds = ['name', 'phone', 'openingBalance', 'createdAt', 'isActive'];
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

  const supplierQuickFilters = getActiveStatusQuickFilters(
    t('table.all'),
    t('status.active'),
    t('status.inactive')
  );

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
