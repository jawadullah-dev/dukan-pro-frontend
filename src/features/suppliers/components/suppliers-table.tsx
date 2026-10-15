'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useQueryState, parseAsString } from 'nuqs';
import { Badge } from '@/components/ui/badge';
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
import { PartyCellAction } from '@/components/common/party-cell-action';

function SupplierCellAction({ data }: SupplierCellActionProps) {
  const t = useT();

  return (
    <PartyCellAction
      id={data.id}
      isActive={data.isActive}
      isSystem={data.isSystem}
      deactivateTitle={t('dukaan.party.supplierDeactivateTitle')}
      deactivateDescription={t('dukaan.party.supplierDeactivateDescription')}
      deactivateConfirmLabel={t('common.deactivate')}
      deactivateSuccess={t('dukaan.party.supplierDeactivated')}
      activateSuccess={t('dukaan.party.supplierActivated')}
      onDeactivate={deactivateSupplier}
      onActivate={reactivateSupplier}
      invalidateQueryKey={supplierKeys.all}
      renderEditDialog={(open, onOpenChange) => (
        <SupplierDialog open={open} onOpenChange={onOpenChange} supplier={data} />
      )}
    />
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
