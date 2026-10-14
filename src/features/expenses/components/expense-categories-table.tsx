'use client';

import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { parseAsString, useQueryState } from 'nuqs';
import { toast } from 'sonner';
import { useT } from '@/i18n/use-t';
import { t } from '@/i18n';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { RowActionsMenu } from '@/components/common/row-actions-menu';
import type { RowAction } from '@/types/dukaan';
import {
  ResponsiveDataTable,
  StatusBadge,
  type DetailConfig,
  type MobileItemConfig
} from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useDataTable } from '@/hooks/use-data-table';
import { parseBooleanFacet, useDukaanListParams } from '@/components/data-table/list-params';
import { AlertModal } from '@/components/modal/alert-modal';
import { formatDate } from '@/lib/format';
import type {
  ExpenseCategoryDTO,
  ExpenseCategorySortField,
  ExpenseCategoryCellActionProps,
  ExpenseCategoriesTableProps
} from '@/types/expense';
import { expenseCategoriesQueryOptions, expenseKeys } from '../api/queries';
import { deleteExpenseCategoryMutation, updateExpenseCategoryMutation } from '../api/mutations';
import { ExpenseCategoryDialog } from './expense-category-dialog';

function ExpenseCategoryCellAction({
  category,
  onEdit,
  onDeactivate,
  onActivate,
  isActivating
}: ExpenseCategoryCellActionProps) {
  const t = useT();

  const actions: RowAction[] = [
    {
      label: t('common.edit'),
      icon: Icons.edit,
      onClick: () => onEdit(category)
    },
    ...(category.isActive
      ? [
          {
            label: t('common.deactivate'),
            icon: Icons.close,
            variant: 'destructive' as const,
            onClick: () => onDeactivate(category)
          }
        ]
      : [
          {
            label: t('common.activate'),
            icon: Icons.check,
            className: 'text-emerald-600 focus:text-emerald-700 dark:text-emerald-400',
            disabled: isActivating,
            onClick: () => onActivate(category)
          }
        ])
  ];

  return (
    <div onClick={(e) => e.stopPropagation()} data-slot='action-cell'>
      <RowActionsMenu actions={actions} />
    </div>
  );
}

const categoryMobileItem: MobileItemConfig<ExpenseCategoryDTO> = {
  title: (row: ExpenseCategoryDTO) => row.name,
  badge: (row: ExpenseCategoryDTO) => ({
    label: row.isActive ? t('status.active') : t('status.inactive'),
    status: row.isActive ? 'ACTIVE' : 'INACTIVE'
  }),
  meta: [(row: ExpenseCategoryDTO) => (row.createdAt ? formatDate(row.createdAt) : '—')]
};

const categoryDetail: DetailConfig<ExpenseCategoryDTO> = {
  mode: 'sheet',
  title: (row: ExpenseCategoryDTO) => row.name,
  badge: (row: ExpenseCategoryDTO) => ({
    label: row.isActive ? t('status.active') : t('status.inactive'),
    status: row.isActive ? 'ACTIVE' : 'INACTIVE'
  }),
  sections: (row: ExpenseCategoryDTO) => [
    {
      title: t('table.col.category'),
      fields: [
        { label: t('table.col.name'), value: row.name },
        {
          label: t('table.col.status'),
          value: row.isActive ? t('status.active') : t('status.inactive')
        },
        { label: t('table.col.createdAt'), value: row.createdAt ? formatDate(row.createdAt) : '—' },
        { label: t('table.col.updatedAt'), value: row.updatedAt ? formatDate(row.updatedAt) : '—' }
      ]
    }
  ]
};

export function ExpenseCategoriesTable({ toolbarAction }: ExpenseCategoriesTableProps) {
  const t = useT();
  const qc = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<ExpenseCategoryDTO | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ExpenseCategoryDTO | null>(null);

  const sortableColumnIds = ['name', 'createdAt', 'updatedAt'];
  const { params, sortBy, sortOrder, getPageCount } = useDukaanListParams<ExpenseCategorySortField>(
    sortableColumnIds,
    'name',
    ['isActive'],
    'name',
    'asc'
  );

  const [nameParam] = useQueryState('name', parseAsString);
  const [searchParam] = useQueryState('search', parseAsString);
  const [isActiveParam] = useQueryState('isActive', parseAsString);

  const search = searchParam || nameParam || undefined;
  const isActiveFilter = parseBooleanFacet(isActiveParam);

  const { data, isLoading, isFetching } = useQuery(
    expenseCategoriesQueryOptions({
      page: params.page,
      pageSize: params.perPage,
      search,
      isActive: isActiveFilter,
      sortBy,
      sortOrder
    })
  );

  const activateMutation = useMutation({
    ...updateExpenseCategoryMutation,
    onSuccess: () => {
      toast.success(t('expenses.categoryActivated'));
      void qc.invalidateQueries({ queryKey: expenseKeys.all });
    },
    onError: (e: Error) => {
      toast.error(e.message || t('expenses.categoryActivateFailed'));
    }
  });

  const deactivateMutation = useMutation({
    ...deleteExpenseCategoryMutation,
    onSuccess: () => {
      toast.success(t('expenses.categoryDeactivated'));
      setDeactivateTarget(null);
      void qc.invalidateQueries({ queryKey: expenseKeys.all });
    },
    onError: (e: Error) => {
      toast.error(e.message || t('expenses.categoryDeactivateFailed'));
    }
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = getPageCount(total);

  const columns: ColumnDef<ExpenseCategoryDTO>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('expenses.nameCol')} />
      ),
      cell: ({ row }) => <span className='font-medium text-foreground'>{row.original.name}</span>,
      meta: {
        label: 'table.col.name',
        placeholderKey: 'search.categories',
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
    {
      id: 'isActive',
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('expenses.statusCol')} />
      ),
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'}
          label={row.original.isActive ? 'Active' : 'Inactive'}
        />
      ),
      meta: {
        label: 'table.col.status',
        variant: 'select',
        options: [
          { label: 'Active', value: 'true' },
          { label: 'Inactive', value: 'false' }
        ],
        priority: 2,
        mobile: 'badge'
      },
      enableColumnFilter: true,
      enableSorting: false
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('expenses.createdAtCol')} />
      ),
      cell: ({ row }) => {
        const val = row.original.createdAt;
        return <span className='font-normal text-foreground'>{val ? formatDate(val) : '—'}</span>;
      },
      meta: {
        label: 'table.col.createdAt',
        variant: 'date',
        priority: 3,
        mobile: 'meta'
      },
      enableColumnFilter: false,
      enableSorting: true
    },
    {
      id: 'actions',
      size: 72,
      header: () => (
        <span className='h-8 inline-flex items-center text-xs font-medium text-foreground'>
          {t('table.actions')}
        </span>
      ),
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <ExpenseCategoryCellAction
            category={row.original}
            onEdit={(cat) => setEditCategory(cat)}
            onDeactivate={(cat) => setDeactivateTarget(cat)}
            onActivate={(cat) =>
              activateMutation.mutate({
                id: cat.id,
                input: { isActive: true }
              })
            }
            isActivating={activateMutation.isPending}
          />
        </div>
      ),
      enableSorting: false
    }
  ];

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount,
    rowCount: total,
    shallow: true,
    debounceMs: 400,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 20 }
    }
  });

  const toolbarActionButton = (
    <div className='flex items-center gap-2'>
      {toolbarAction}
      <Button type='button' size='sm' className='h-8 gap-1.5' onClick={() => setCreateOpen(true)}>
        <Icons.add className='h-3.5 w-3.5' />
        <span>{t('expenses.addCategory')}</span>
      </Button>
    </div>
  );

  return (
    <>
      {createOpen && <ExpenseCategoryDialog open={createOpen} onOpenChange={setCreateOpen} />}

      {editCategory && (
        <ExpenseCategoryDialog
          open={!!editCategory}
          category={editCategory}
          onOpenChange={(open) => {
            if (!open) setEditCategory(null);
          }}
        />
      )}

      {deactivateTarget && (
        <AlertModal
          isOpen={!!deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={() => deactivateMutation.mutate(deactivateTarget.id)}
          loading={deactivateMutation.isPending}
          title={t('common.deactivate')}
          description={t('expenses.deactivateDesc', { name: deactivateTarget.name })}
          confirmLabel={t('common.deactivate')}
        />
      )}

      <ResponsiveDataTable
        table={table}
        toolbarAction={toolbarActionButton}
        mobileItem={categoryMobileItem}
        detail={categoryDetail}
        isLoading={isLoading || isFetching}
        rowCount={items.length > 0 ? items.length : total > 0 ? total : undefined}
      />
    </>
  );
}
