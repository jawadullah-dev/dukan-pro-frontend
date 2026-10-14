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
import { RowActionsMenu } from '@/components/common/row-actions-menu';
import type { PlatformSubscription } from '../api/types';
import { platformSubscriptionsQueryOptions } from '../api/queries';
import { PLATFORM_PLAN_OPTIONS, PLATFORM_STATUS_OPTIONS } from '../constants/filters';
import { ShopStatusBadge } from './shop-status-badge';
import { useT } from '@/i18n/use-t';

const columns: ColumnDef<PlatformSubscription>[] = [
  {
    id: 'shop_name',
    accessorKey: 'shop_name',
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('platform.shop')} />;
    },
    meta: {
      label: 'platform.shop',
      placeholder: 'platform.searchSubscriptions',
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
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('platform.plan')} />;
    },
    cell: ({ row }) => <span className='capitalize'>{row.original.plan.toLowerCase()}</span>,
    meta: {
      label: 'platform.all',
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
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('table.col.status')} />;
    },
    cell: ({ row }) => <ShopStatusBadge status={row.original.status} />,
    meta: {
      label: 'platform.allStatuses',
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
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('platform.nextDue')} />;
    },
    cell: ({ row }) => row.original.next_due_at ?? '—',
    meta: { label: 'platform.nextDue', type: 'date', priority: 2 }
  },
  {
    id: 'amount_paisa',
    accessorKey: 'amount_paisa',
    header: ({ column }) => {
      const t = useT();
      return <DataTableColumnHeader column={column} title={t('platform.amount')} />;
    },
    cell: ({ row }) =>
      row.original.amount_paisa > 0 ? formatPkr(row.original.amount_paisa) : 'Rs 0',
    meta: {
      label: 'platform.amount',
      type: 'money',
      highlight: true,
      priority: 1
    }
  },
  {
    id: 'actions',
    meta: { mobile: 'hidden' },
    cell: () => {
      const t = useT();
      return (
        <RowActionsMenu
          actions={[
            { label: t('platform.assignPlan'), onClick: () => {} },
            { label: t('platform.viewShop'), href: '/dashboard/platform/shops' }
          ]}
        />
      );
    },
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
  sections: (row) => {
    const t = useT();
    return [
      {
        title: t('platform.subscription'),
        fields: [
          { label: t('platform.shop'), value: row.shop_name },
          { label: t('platform.plan'), value: formatLabel(row.plan) },
          { label: t('table.col.status'), value: <ShopStatusBadge status={row.status} /> },
          { label: t('platform.nextDue'), value: row.next_due_at ?? '—' },
          {
            label: t('platform.amount'),
            value: row.amount_paisa > 0 ? formatPkr(row.amount_paisa) : 'Rs 0'
          }
        ]
      }
    ];
  }
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

  const items = facetValues.plan?.length
    ? data.items.filter((row) => Boolean(facetValues.plan?.includes(row.plan)))
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
