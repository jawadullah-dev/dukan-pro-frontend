'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState, useQueryStates } from 'nuqs';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { formatPkr } from '@/lib/dukaan/numbers';
import { Icons } from '@/components/icons';
import { RowActionsMenu } from '@/features/dukaan/components/row-actions-menu';
import type { PlatformSubscription } from '../api/types';
import { platformSubscriptionsQueryOptions } from '../api/queries';
import { PLATFORM_PLAN_OPTIONS, PLATFORM_STATUS_OPTIONS } from '../constants/filters';
import { ShopStatusBadge } from './shop-status-badge';

const columns: ColumnDef<PlatformSubscription>[] = [
  {
    id: 'shop_name',
    accessorKey: 'shop_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Shop' />,
    meta: {
      label: 'Shop',
      placeholder: 'Search subscriptions…',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'plan',
    accessorKey: 'plan',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Plan' />,
    cell: ({ row }) => <span className='capitalize'>{row.original.plan.toLowerCase()}</span>,
    meta: {
      label: 'All',
      variant: 'multiSelect',
      options: [...PLATFORM_PLAN_OPTIONS]
    },
    enableColumnFilter: true
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => <ShopStatusBadge status={row.original.status} />,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: [...PLATFORM_STATUS_OPTIONS]
    },
    enableColumnFilter: true
  },
  {
    id: 'next_due_at',
    accessorKey: 'next_due_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Next due' />,
    cell: ({ row }) => row.original.next_due_at ?? '—',
    meta: { label: 'Next due' }
  },
  {
    id: 'amount_paisa',
    accessorKey: 'amount_paisa',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
    cell: ({ row }) =>
      row.original.amount_paisa > 0 ? formatPkr(row.original.amount_paisa) : 'Rs 0',
    meta: { label: 'Amount' }
  },
  {
    id: 'actions',
    cell: () => (
      <RowActionsMenu
        actions={[
          { label: 'Assign plan', onClick: () => {} },
          { label: 'View shop', href: '/dashboard/platform/shops' }
        ]}
      />
    ),
    enableSorting: false
  }
];

export function PlatformSubscriptionsTable() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [shopName] = useQueryState('shop_name', parseAsString);
  const [facetValues] = useQueryStates({
    status: parseAsArrayOf(parseAsString, ','),
    plan: parseAsArrayOf(parseAsString, ',')
  });

  const filters = {
    page,
    limit: perPage,
    ...(shopName && { search: shopName }),
    ...(facetValues.status?.length && {
      status: facetValues.status.join(',') as PlatformSubscription['status']
    })
  };

  const { data } = useSuspenseQuery(platformSubscriptionsQueryOptions(filters));

  // Client-side plan filter (API supports status + search)
  const items = facetValues.plan?.length
    ? data.items.filter((row) => facetValues.plan!.includes(row.plan))
    : data.items;

  const pageCount = Math.max(1, Math.ceil(data.total_items / perPage));

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount,
    rowCount: data.total_items,
    shallow: true,
    debounceMs: 400,
    initialState: {
      pagination: { pageIndex: page - 1, pageSize: perPage },
      columnPinning: { right: ['actions'] }
    }
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
