'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ResponsiveDataTable } from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { useT } from '@/i18n/use-t';
import { t } from '@/i18n';
import { SimpleEntityCellAction } from '@/components/common/simple-entity-cell-action';
import { brandsQueryOptions, brandKeys } from '../api/queries';
import { deleteBrand } from '../api/service';
import type { BrandDTO } from '@/lib/api/types';
import type { BrandCellActionProps, BrandsTableProps } from '@/types';
import {
  createPartyIsActiveColumn,
  buildSimpleEntityMobileItem,
  buildSimpleEntityDetail
} from '@/components/common/party-table-helpers';
import { DUKAAN_DEFAULT_PAGE_SIZE, useDukaanListParams } from '@/components/data-table/list-params';
import { BrandDialog } from './brand-dialog';

function BrandCellAction({ data }: BrandCellActionProps) {
  const t = useT();

  return (
    <SimpleEntityCellAction
      id={data.id}
      deleteTitle={t('dukaan.brand.deleteTitle')}
      deleteDescription={t('dukaan.brand.deleteDescription')}
      deleteSuccess={t('dukaan.brand.deleted')}
      onDelete={deleteBrand}
      invalidateQueryKey={brandKeys.all}
      renderDialog={(open, onOpenChange) => (
        <BrandDialog open={open} onOpenChange={onOpenChange} brand={data} />
      )}
    />
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
  createPartyIsActiveColumn<BrandDTO>(),
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

const brandMobileItem = buildSimpleEntityMobileItem<BrandDTO>(Icons.tag);
const brandDetail = buildSimpleEntityDetail<BrandDTO>(t('table.col.brand'));

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
