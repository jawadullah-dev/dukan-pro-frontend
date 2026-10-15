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
import { categoriesQueryOptions, categoryKeys } from '../api/queries';
import { deleteCategory } from '../api/service';
import type { CategoryDTO } from '@/lib/api/types';
import type { CategoryCellActionProps, CategoriesTableProps } from '@/types';
import {
  createPartyIsActiveColumn,
  buildSimpleEntityMobileItem,
  buildSimpleEntityDetail
} from '@/components/common/party-table-helpers';
import { DUKAAN_DEFAULT_PAGE_SIZE, useDukaanListParams } from '@/components/data-table/list-params';
import { CategoryDialog } from './category-dialog';

function CategoryCellAction({ data }: CategoryCellActionProps) {
  const t = useT();

  return (
    <SimpleEntityCellAction
      id={data.id}
      deleteTitle={t('dukaan.category.deleteTitle')}
      deleteDescription={t('dukaan.category.deleteDescription')}
      deleteSuccess={t('dukaan.category.deleted')}
      onDelete={deleteCategory}
      invalidateQueryKey={categoryKeys.all}
      renderDialog={(open, onOpenChange) => (
        <CategoryDialog open={open} onOpenChange={onOpenChange} category={data} />
      )}
    />
  );
}

const categoryColumns: ColumnDef<CategoryDTO>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.name')} />,
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
  createPartyIsActiveColumn<CategoryDTO>(),
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

const categoryMobileItem = buildSimpleEntityMobileItem<CategoryDTO>(Icons.folder);
const categoryDetail = buildSimpleEntityDetail<CategoryDTO>(t('table.col.category'));

export function CategoriesTable({ toolbarAction }: CategoriesTableProps) {
  const columnIds = ['name', 'isActive'];
  const { params, filters } = useDukaanListParams(columnIds);
  const { data } = useSuspenseQuery(
    categoriesQueryOptions({ page: params.page, pageSize: params.perPage, search: filters.search })
  );
  const pageCount = Math.max(1, Math.ceil(data.total / params.perPage));
  const { table } = useDataTable({
    data: data.items,
    columns: categoryColumns,
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
      mobileItem={categoryMobileItem}
      detail={categoryDetail}
    />
  );
}
