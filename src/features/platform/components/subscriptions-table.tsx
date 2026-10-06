'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState, useQueryStates } from 'nuqs';
import {
  ResponsiveDataTable,
  type DetailConfig,
  type MobileItemConfig
} from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useDataTable } from '@/hooks/use-data-table';
import { formatLabel, formatPkr } from '@/lib/dukaan/numbers';
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
      icon: Icons.search,
      type: 'text',
      primary: true,
      priority: 1
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
      options: [...PLATFORM_PLAN_OPTIONS],
      type: 'text',
      priority: 2
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
      options: [...PLATFORM_STATUS_OPTIONS],
      type: 'status',
      priority: 1
    },
    enableColumnFilter: true
  },
  {
    id: 'next_due_at',
    accessorKey: 'next_due_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Next due' />,
    cell: ({ row }) => row.original.next_due_at ?? '—',
    meta: { label: 'Next due', type: 'date', priority: 2 }
  },
  {
    id: 'amount_paisa',
    accessorKey: 'amount_paisa',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
    cell: ({ row }) =>
      row.original.amount_paisa > 0 ? formatPkr(row.original.amount_paisa) : 'Rs 0',
    meta: {
      label: 'Amount',
      type: 'money',
      highlight: true,
      priority: 1
    }
  },
  {
    id: 'actions',
    meta: { mobile: 'hidden' },
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

const subscriptionMobileItem: MobileItemConfig<PlatformSubscription> = {
  title: (row) => row.shop_name,
  subtitle: (row) => formatLabel(row.plan),
  badge: (row) => ({ label: row.status, status: row.status }),
  value: (row) => (row.amount_paisa > 0 ? formatPkr(row.amount_paisa) : 'Rs 0'),
  meta: [(row) => row.next_due_at ?? '—'],
  ariaLabel: (row) => `${row.shop_name}, ${formatLabel(row.plan)}, ${formatPkr(row.amount_paisa)}`
};

const subscriptionDetail: DetailConfig<PlatformSubscription> = {
  mode: 'sheet',
  title: (row) => row.shop_name,
  badge: (row) => ({ label: row.status, status: row.status }),
  value: (row) => (row.amount_paisa > 0 ? formatPkr(row.amount_paisa) : 'Rs 0'),
  sections: (row) => [
    {
      title: 'Subscription',
      fields: [
        { label: 'Shop', value: row.shop_name },
        { label: 'Plan', value: formatLabel(row.plan) },
        { label: 'Status', value: <ShopStatusBadge status={row.status} /> },
        { label: 'Next due', value: row.next_due_at ?? '—' },
        {
          label: 'Amount',
          value: row.amount_paisa > 0 ? formatPkr(row.amount_paisa) : 'Rs 0'
        }
      ]
    }
  ]
};

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
    <ResponsiveDataTable
      table={table}
      mobileItem={subscriptionMobileItem}
      detail={subscriptionDetail}
    />
  );
}
