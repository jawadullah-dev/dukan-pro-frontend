'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { User } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { ROLE_OPTIONS } from './options';
import { useT } from '@/i18n/use-t';

export function getColumns(): ColumnDef<User>[] {
  return [
    {
      id: 'name',
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      header: ({ column }: { column: Column<User, unknown> }) => (
        <NameColumnHeader column={column} />
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
        label: 'users.firstName',
        placeholderKey: 'users.search' as const,
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
        <PhoneColumnHeader column={column} />
      ),
      meta: { label: 'users.phone', type: 'phone', priority: 2 }
    },
    {
      id: 'role',
      accessorKey: 'role',
      enableSorting: false,
      header: ({ column }: { column: Column<User, unknown> }) => (
        <RoleColumnHeader column={column} />
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
        label: 'users.role',
        variant: 'multiSelect' as const,
        options: (t: (key: string) => string) => ROLE_OPTIONS(t),
        type: 'text',
        priority: 2
      }
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }: { column: Column<User, unknown> }) => (
        <StatusColumnHeader column={column} />
      ),
      cell: ({ cell }) => {
        const status = cell.getValue<User['status']>();
        const variant =
          status === 'Active' ? 'default' : status === 'Inactive' ? 'secondary' : 'outline';
        return <Badge variant={variant}>{status}</Badge>;
      },
      meta: { label: 'users.status', type: 'status', priority: 1 }
    },
    {
      id: 'actions',
      meta: { mobile: 'hidden' },
      cell: ({ row }) => <CellAction data={row.original} />
    }
  ];
}

function NameColumnHeader({ column }: { column: Column<User, unknown> }) {
  const t = useT();
  return <DataTableColumnHeader column={column} title={t('users.firstName')} />;
}

function PhoneColumnHeader({ column }: { column: Column<User, unknown> }) {
  const t = useT();
  return <DataTableColumnHeader column={column} title={t('users.phone')} />;
}

function RoleColumnHeader({ column }: { column: Column<User, unknown> }) {
  const t = useT();
  return <DataTableColumnHeader column={column} title={t('users.role')} />;
}

function StatusColumnHeader({ column }: { column: Column<User, unknown> }) {
  const t = useT();
  return <DataTableColumnHeader column={column} title={t('users.status')} />;
}
