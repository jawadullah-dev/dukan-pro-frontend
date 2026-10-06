'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import type { DetailConfig, MobileItemConfig } from '@/components/data-table';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import type { User } from '../../api/types';
import { usersQueryOptions } from '../../api/queries';
import { columns } from './columns';

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

const userMobileItem: MobileItemConfig<User> = {
  leading: 'avatar',
  title: (row) => `${row.first_name} ${row.last_name}`,
  subtitle: (row) => row.phone,
  badge: (row) => ({ label: row.status, status: row.status }),
  meta: [(row) => row.role],
  ariaLabel: (row) => `${row.first_name} ${row.last_name}, ${row.phone}, ${row.status}`
};

const userDetail: DetailConfig<User> = {
  mode: 'sheet',
  title: (row) => `${row.first_name} ${row.last_name}`,
  badge: (row) => ({ label: row.status, status: row.status }),
  sections: (row) => [
    {
      title: 'User',
      fields: [
        { label: 'Name', value: `${row.first_name} ${row.last_name}` },
        { label: 'Email', value: row.email },
        {
          label: 'Phone',
          value: (
            <a
              className='text-primary underline-offset-2 hover:underline'
              href={`tel:${row.phone}`}
            >
              {row.phone}
            </a>
          )
        },
        { label: 'Role', value: row.role },
        { label: 'Status', value: row.status }
      ]
    }
  ]
};

export function UsersTable() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    role: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([])
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name }),
    ...(params.role && { roles: params.role }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  };

  const { data } = useSuspenseQuery(usersQueryOptions(filters));

  const pageCount = Math.ceil(data.total_users / params.perPage);

  const { table } = useDataTable({
    data: data.users,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  return (
    <DataTable table={table} mobileItem={userMobileItem} detail={userDetail}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}

export function UsersTableSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='bg-muted h-10 w-full rounded' />
      <div className='bg-muted h-96 w-full rounded-lg' />
      <div className='bg-muted h-10 w-full rounded' />
    </div>
  );
}
