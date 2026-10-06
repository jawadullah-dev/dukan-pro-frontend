'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState, useQueryStates } from 'nuqs';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { Icons } from '@/components/icons';
import { RowActionsMenu } from '@/features/dukaan/components/row-actions-menu';
import type { PlatformShop } from '../api/types';
import { platformShopsQueryOptions } from '../api/queries';
import { PLATFORM_CITY_OPTIONS, PLATFORM_STATUS_OPTIONS } from '../constants/filters';
import { ShopStatusBadge } from './shop-status-badge';

const columns: ColumnDef<PlatformShop>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Shop Name' />,
    cell: ({ row }) => (
      <div className='min-w-40'>
        <p className='font-medium'>{row.original.name}</p>
        <p className='text-muted-foreground text-xs'>{row.original.address}</p>
      </div>
    ),
    meta: {
      label: 'Shop',
      placeholder: 'Search shops by name, owner, phone…',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'owner_name',
    accessorKey: 'owner_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Owner Name' />,
    cell: ({ row }) => (
      <div>
        <p className='font-medium'>{row.original.owner_name}</p>
        <p className='text-muted-foreground text-xs'>{row.original.owner_phone}</p>
      </div>
    ),
    meta: { label: 'Owner' }
  },
  {
    id: 'city',
    accessorKey: 'city',
    header: ({ column }) => <DataTableColumnHeader column={column} title='City' />,
    cell: ({ row }) => <span className='font-medium'>{row.original.city}</span>,
    meta: {
      label: 'All Cities',
      variant: 'multiSelect',
      options: [...PLATFORM_CITY_OPTIONS]
    },
    enableColumnFilter: true
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => <ShopStatusBadge status={row.original.status} />,
    meta: {
      label: 'All Statuses',
      variant: 'multiSelect',
      options: [...PLATFORM_STATUS_OPTIONS]
    },
    enableColumnFilter: true
  },
  {
    id: 'trial_ends_at',
    accessorKey: 'trial_ends_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Trial Ends' />,
    cell: ({ row }) => row.original.trial_ends_at ?? '—',
    meta: { label: 'Trial Ends' }
  },
  {
    id: 'next_due_at',
    accessorKey: 'next_due_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Next Due Date' />,
    cell: ({ row }) => row.original.next_due_at ?? '—',
    meta: { label: 'Next Due Date' }
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <RowActionsMenu
        actions={[
          { label: 'View shop', href: `/dashboard/platform/shops?shop=${row.original.id}` },
          { label: 'Subscription', href: '/dashboard/platform/subscriptions' }
        ]}
      />
    ),
    enableSorting: false
  }
];

export function PlatformShopsTable() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [name] = useQueryState('name', parseAsString);
  const [facetValues] = useQueryStates({
    city: parseAsArrayOf(parseAsString, ','),
    status: parseAsArrayOf(parseAsString, ',')
  });

  const filters = {
    page,
    limit: perPage,
    ...(name && { search: name }),
    ...(facetValues.city?.length && { city: facetValues.city.join(',') }),
    ...(facetValues.status?.length && {
      status: facetValues.status.join(',') as PlatformShop['status']
    })
  };

  const { data } = useSuspenseQuery(platformShopsQueryOptions(filters));
  const pageCount = Math.max(1, Math.ceil(data.total_items / perPage));

  const { table } = useDataTable({
    data: data.items,
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
