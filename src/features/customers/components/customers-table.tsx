'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { toast } from 'sonner';
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
import type { CustomerDTO } from '@/lib/api/types';
import { customerKeys, customersQueryOptions } from '../api/queries';
import { deactivateCustomer, reactivateCustomer } from '../api/service';
import type { CustomerListFilters } from '@/types';
import { CustomerDialog } from './customer-dialog';
import type { CustomerCellActionProps, CustomersTableProps } from '@/types';
import {
  createPartyPhoneColumn,
  createPartyCreatedAtColumn,
  createPartyIsActiveColumn,
  PartyActionsHeader,
  buildPartyMobileItem,
  buildPartyDetail,
  getActiveStatusQuickFilters
} from '@/components/common/party-table-helpers';

function CustomerCellAction({ data }: CustomerCellActionProps) {
  const t = useT();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const archive = useMutation({
    mutationFn: () => deactivateCustomer(data.id),
    onSuccess: () => {
      toast.success(t('dukaan.party.customerArchived'));
      setArchiveOpen(false);
      void qc.invalidateQueries({ queryKey: customerKeys.all });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const activate = useMutation({
    mutationFn: () => reactivateCustomer(data.id),
    onSuccess: () => {
      toast.success(t('dukaan.party.customerActivated'));
      void qc.invalidateQueries({ queryKey: customerKeys.all });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role='presentation'
      data-slot='action-cell'
    >
      <AlertModal
        isOpen={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        onConfirm={() => archive.mutate()}
        loading={archive.isPending}
        title={t('dukaan.party.customerArchiveTitle')}
        description={t('dukaan.party.customerArchiveDescription')}
        confirmLabel={t('common.archive')}
      />
      <CustomerDialog open={editOpen} onOpenChange={setEditOpen} customer={data} />
      <RowActionsMenu
        actions={[
          {
            label: t('table.openLedger'),
            icon: Icons.page,
            href: `/dashboard/customers/${data.id}`
          },
          {
            label: t('common.edit'),
            icon: Icons.edit,
            onClick: () => setEditOpen(true)
          },
          ...(data.isActive
            ? [
                {
                  label: t('common.archive'),
                  icon: Icons.archive,
                  className: 'text-amber-600 focus:text-amber-700 dark:text-amber-400',
                  onClick: () => setArchiveOpen(true)
                }
              ]
            : [
                {
                  label: t('common.activate'),
                  icon: Icons.check,
                  className: 'text-emerald-600 focus:text-emerald-700 dark:text-emerald-400',
                  disabled: activate.isPending,
                  onClick: () => activate.mutate()
                }
              ])
        ]}
      />
    </div>
  );
}

const customerColumns: ColumnDef<CustomerDTO>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.name')} />,
    meta: {
      label: 'table.col.name',
      placeholderKey: 'search.customers' as const,
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
  createPartyPhoneColumn<CustomerDTO>(),
  {
    id: 'openingBalance',
    accessorKey: 'openingBalance',
    size: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('dukaan.party.customerOpeningBalance')} />
    ),
    meta: {
      label: 'dukaan.party.customerOpeningBalance',
      type: 'money',
      priority: 2,
      mobile: 'value'
    },
    enableSorting: true,
    cell: ({ row }) => formatPkr(row.original.openingBalance)
  },
  createPartyCreatedAtColumn<CustomerDTO>(),
  createPartyIsActiveColumn<CustomerDTO>(),
  {
    id: 'actions',
    size: 72,
    header: PartyActionsHeader,
    enableSorting: false,
    enableHiding: false,
    meta: { mobile: 'hidden' },
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <CustomerCellAction data={row.original} />
      </div>
    )
  }
];

const customerMobileItem: MobileItemConfig<CustomerDTO> = buildPartyMobileItem<CustomerDTO>(() =>
  t('dukaan.party.customerOpeningBalance')
);

const customerDetail: DetailConfig<CustomerDTO> = buildPartyDetail<CustomerDTO>({
  partyName: t('dukaan.party.name'),
  balance: t('table.balance'),
  openingBalance: t('dukaan.party.customerOpeningBalance')
});

export function CustomersTable({ toolbarAction }: CustomersTableProps) {
  const t = useT();

  const sortableColumnIds = ['name', 'phone', 'openingBalance', 'createdAt', 'isActive'];
  const { params, sortBy, sortOrder, getPageCount } = useDukaanListParams<
    CustomerListFilters['sortBy']
  >(sortableColumnIds, 'name', ['isActive'], 'createdAt');

  const [nameParam] = useQueryState('name', parseAsString);
  const [searchParam] = useQueryState('search', parseAsString);
  const [isActiveParam] = useQueryState('isActive', parseAsString);

  const search = searchParam || nameParam || undefined;
  const isActiveFilter = parseBooleanFacet(isActiveParam);

  const { data, isLoading, isFetching } = useQuery(
    customersQueryOptions({
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
    columns: customerColumns,
    pageCount,
    rowCount: total,
    shallow: true,
    debounceMs: 400,
    initialState: {
      pagination: { pageIndex: 0, pageSize: DUKAAN_DEFAULT_PAGE_SIZE }
    }
  });

  const customerQuickFilters = getActiveStatusQuickFilters(
    t('table.all'),
    t('status.active'),
    t('status.inactive')
  );

  return (
    <ResponsiveDataTable
      table={table}
      toolbarAction={toolbarAction}
      mobileItem={customerMobileItem}
      detail={customerDetail}
      quickFilters={customerQuickFilters}
      isLoading={isLoading || isFetching}
      rowCount={items.length > 0 ? items.length : total > 0 ? total : undefined}
    />
  );
}
