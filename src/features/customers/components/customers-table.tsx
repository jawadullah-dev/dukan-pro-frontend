'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryState, parseAsString } from 'nuqs';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
import { DUKAAN_DEFAULT_PAGE_SIZE, useDukaanListParams } from '@/components/data-table/list-params';
import { formatPkr } from '@/lib/dukaan/numbers';
import { formatDate } from '@/lib/format';
import type { CustomerDTO } from '@/lib/api/types';
import { customerKeys, customersQueryOptions } from '../api/queries';
import { deactivateCustomer, reactivateCustomer } from '../api/service';
import type { CustomerListFilters } from '../api/service';
import { CustomerDialog } from './customer-dialog';

// ---------------------------------------------------------------------------
// Cell action
// ---------------------------------------------------------------------------

interface CustomerCellActionProps {
  data: CustomerDTO;
}

function CustomerCellAction({ data }: CustomerCellActionProps) {
  const t = useT();
  const router = useRouter();
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
    <div onClick={(e) => e.stopPropagation()} data-slot='action-cell'>
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
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
          <span className='sr-only'>{t('common.openMenu')}</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-40'>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/customers/${data.id}`);
              }}
            >
              <Icons.page className='me-2 h-4 w-4' /> {t('table.openLedger')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                requestAnimationFrame(() => setEditOpen(true));
              }}
            >
              <Icons.edit className='me-2 h-4 w-4' /> {t('common.edit')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {data.isActive ? (
              <DropdownMenuItem
                className='text-amber-600 focus:text-amber-700 dark:text-amber-400'
                onClick={(e) => {
                  e.stopPropagation();
                  requestAnimationFrame(() => setArchiveOpen(true));
                }}
              >
                <Icons.archive className='me-2 h-4 w-4' /> {t('common.archive')}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className='text-emerald-600 focus:text-emerald-700 dark:text-emerald-400'
                onClick={(e) => {
                  e.stopPropagation();
                  activate.mutate();
                }}
                disabled={activate.isPending}
              >
                <Icons.check className='me-2 h-4 w-4' /> {t('common.activate')}
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Columns: Phone except phone, all others have sorting enabled
// ---------------------------------------------------------------------------

const customerColumns: ColumnDef<CustomerDTO>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('table.col.name')} />;
    },
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
  {
    id: 'phone',
    accessorKey: 'phone',
    size: 160,
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('table.col.phone')} />;
    },
    meta: { label: 'table.col.phone', type: 'phone', priority: 2, mobile: 'subtitle' },
    enableSorting: true, // Phone sorting enabled
    cell: ({ row }) => row.original.phone || '—'
  },
  {
    id: 'openingBalance',
    accessorKey: 'openingBalance',
    size: 180,
    header: ({ column }) => {
      const t = useT();
      return (
        <DataTableColumnHeader column={column} title={t('dukaan.party.customerOpeningBalance')} />
      );
    },
    meta: {
      label: 'dukaan.party.customerOpeningBalance',
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
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('table.col.date')} />;
    },
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
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('table.col.status')} />;
    },
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
    enableSorting: true, // Status also has sorting enabled
    cell: ({ row }) => {
      const t = useT();
      return (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? t('status.active') : t('status.inactive')}
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    size: 72,
    header: () => {
      const t = useT();
      return (
        <span className='h-8 inline-flex items-center text-xs font-medium text-foreground'>
          {t('table.actions')}
        </span>
      );
    },
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

const customerMobileItem: MobileItemConfig<CustomerDTO> = {
  leading: 'avatar',
  title: (row) => row.name,
  subtitle: (row) => row.phone ?? undefined,
  badge: (row) => ({
    label: row.isActive ? t('status.active') : t('status.inactive'),
    status: row.isActive ? 'ACTIVE' : 'INACTIVE'
  }),
  value: (row) => formatPkr(row.openingBalance),
  valueLabel: () => t('dukaan.party.customerOpeningBalance'),
  ariaLabel: (row) => `${row.name}, ${row.phone ?? ''}, ${row.isActive ? 'Active' : 'Inactive'}`
};

const customerDetail: DetailConfig<CustomerDTO> = {
  mode: 'sheet',
  title: (row) => row.name,
  badge: (row) => ({
    label: row.isActive ? t('status.active') : t('status.inactive'),
    status: row.isActive ? 'ACTIVE' : 'INACTIVE'
  }),
  value: (row) => formatPkr(row.openingBalance),
  sections: (row) => [
    {
      title: t('dukaan.party.name'),
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
          label: t('dukaan.party.customerOpeningBalance'),
          value: formatPkr(row.openingBalance)
        }
      ]
    }
  ]
};

// ---------------------------------------------------------------------------
// Table component
// ---------------------------------------------------------------------------

interface CustomersTableProps {
  toolbarAction?: ReactNode;
}

export function CustomersTable({ toolbarAction }: CustomersTableProps) {
  const t = useT();

  // All columns have sorting enabled
  const sortableColumnIds = ['name', 'phone', 'openingBalance', 'createdAt', 'isActive'];
  const { params } = useDukaanListParams(sortableColumnIds, 'name', ['isActive']);

  // URL state synchronization for search and status filter
  const [nameParam] = useQueryState('name', parseAsString);
  const [searchParam] = useQueryState('search', parseAsString);
  const [isActiveParam] = useQueryState('isActive', parseAsString);

  const search = searchParam || nameParam || undefined;

  let isActiveFilter: boolean | undefined;
  if (isActiveParam) {
    if (isActiveParam === 'true' || isActiveParam.includes('true')) {
      isActiveFilter = true;
    } else if (isActiveParam === 'false' || isActiveParam.includes('false')) {
      isActiveFilter = false;
    }
  }

  // Determine sort parameters safely
  const sortItem = params.sort[0];
  let sortBy: CustomerListFilters['sortBy'] = 'createdAt';
  let sortOrder: 'asc' | 'desc' = 'desc';

  if (sortItem && sortableColumnIds.includes(sortItem.id)) {
    sortBy = sortItem.id as CustomerListFilters['sortBy'];
    sortOrder = sortItem.desc ? 'desc' : 'asc';
  }

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
  const pageCount = Math.max(1, Math.ceil(total / params.perPage));
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

  const customerQuickFilters: QuickFilterChip[] = [
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
      mobileItem={customerMobileItem}
      detail={customerDetail}
      quickFilters={customerQuickFilters}
      isLoading={isLoading || isFetching}
      rowCount={items.length > 0 ? items.length : total > 0 ? total : undefined}
    />
  );
}
