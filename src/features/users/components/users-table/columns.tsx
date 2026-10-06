'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { User } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { ROLE_OPTIONS } from './options';

export const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>
          {row.original.first_name} {row.original.last_name}
        </span>
        <span className='text-muted-foreground text-xs'>{row.original.email}</span>
      </div>
    ),
    meta: {
      label: 'Name',
      placeholder: 'Search users...',
      variant: 'text' as const,
      icon: Icons.text,
      type: 'text',
      primary: true,
      priority: 1
    },
    enableColumnFilter: true
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    meta: { label: 'Phone', type: 'phone', priority: 2 }
  },
  {
    id: 'role',
    accessorKey: 'role',
    enableSorting: false,
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ cell }) => {
      return (
        <Badge variant='outline' className='capitalize'>
          {cell.getValue<User['role']>()}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'roles',
      variant: 'multiSelect' as const,
      options: ROLE_OPTIONS,
      type: 'text',
      priority: 2
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<User['status']>();
      const variant =
        status === 'Active' ? 'default' : status === 'Inactive' ? 'secondary' : 'outline';
      return <Badge variant={variant}>{status}</Badge>;
    },
    meta: { label: 'Status', type: 'status', priority: 1 }
  },
  {
    id: 'actions',
    meta: { mobile: 'hidden' },
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
