'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import {
  StatusBadge,
  type DetailConfig,
  type MobileItemConfig,
  type QuickFilterChip
} from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { formatPkr } from '@/lib/dukaan/numbers';
import { formatDate } from '@/lib/format';
import { t } from '@/i18n';
import type { BasePartyRecord, PartyDetailLabels } from '@/types/party';
import type { HasStatusRecord, HasAmountRecord, HasIsActiveRecord } from '@/types/common';

export function createPartyPhoneColumn<T extends BasePartyRecord>(): ColumnDef<T> {
  return {
    id: 'phone',
    accessorKey: 'phone',
    size: 160,
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.phone')} />,
    meta: { label: 'table.col.phone', type: 'phone', priority: 2, mobile: 'subtitle' },
    enableSorting: true,
    cell: ({ row }) => (row.original as T).phone || '—'
  };
}

export function createPartyCreatedAtColumn<T extends BasePartyRecord>(): ColumnDef<T> {
  return {
    id: 'createdAt',
    accessorKey: 'createdAt',
    size: 140,
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.date')} />,
    meta: {
      label: 'table.col.date',
      type: 'date',
      priority: 3,
      mobile: 'hidden'
    },
    enableSorting: true,
    cell: ({ row }) =>
      formatDate((row.original as T).createdAt, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
  };
}

export function createPartyIsActiveColumn<T extends HasIsActiveRecord>(): ColumnDef<T> {
  return {
    id: 'isActive',
    accessorKey: 'isActive' as keyof T,
    size: 110,
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.status')} />,
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
    enableSorting: true,
    cell: ({ row }) => (
      <Badge variant={(row.original as T).isActive ? 'default' : 'secondary'}>
        {(row.original as T).isActive ? t('status.active') : t('status.inactive')}
      </Badge>
    )
  };
}

export function PartyActionsHeader() {
  return (
    <span className='h-8 inline-flex items-center text-xs font-medium text-foreground'>
      {t('table.actions')}
    </span>
  );
}

export function buildPartyMobileItem<T extends BasePartyRecord>(
  valueLabelFn: () => string
): MobileItemConfig<T> {
  return {
    leading: 'avatar',
    title: (row) => row.name,
    subtitle: (row) => row.phone ?? undefined,
    badge: (row) => ({
      label: row.isActive ? t('status.active') : t('status.inactive'),
      status: row.isActive ? 'ACTIVE' : 'INACTIVE'
    }),
    value: (row) => formatPkr(row.openingBalance),
    valueLabel: valueLabelFn,
    ariaLabel: (row) => `${row.name}, ${row.phone ?? ''}, ${row.isActive ? 'Active' : 'Inactive'}`
  };
}

export function buildPartyDetail<T extends BasePartyRecord>(
  labels: PartyDetailLabels
): DetailConfig<T> {
  return {
    mode: 'sheet',
    title: (row) => row.name,
    badge: (row) => ({
      label: row.isActive ? t('status.active') : t('status.inactive'),
      status: row.isActive ? 'ACTIVE' : 'INACTIVE'
    }),
    value: (row) => formatPkr(row.openingBalance),
    sections: (row) => [
      {
        title: labels.partyName,
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
        title: labels.balance,
        fields: [
          {
            label: labels.openingBalance,
            value: formatPkr(row.openingBalance)
          }
        ]
      }
    ]
  };
}

export function getActiveStatusQuickFilters(
  allLabel: string,
  activeLabel: string,
  inactiveLabel: string
): QuickFilterChip[] {
  return [
    { id: 'all', label: allLabel },
    {
      id: 'active',
      label: activeLabel,
      columnId: 'isActive',
      value: ['true']
    },
    {
      id: 'inactive',
      label: inactiveLabel,
      columnId: 'isActive',
      value: ['false']
    }
  ];
}

export function createActiveCancelledStatusColumn<T extends HasStatusRecord>(
  statusTitle: string
): ColumnDef<T> {
  return {
    id: 'status',
    accessorKey: 'status' as keyof T,
    header: ({ column }) => <DataTableColumnHeader column={column} title={statusTitle} />,
    cell: ({ row }) => {
      const isCancelled = (row.original as T).status === 'CANCELLED';
      return (
        <StatusBadge
          status={(row.original as T).status}
          label={isCancelled ? 'Cancelled' : 'Active'}
        />
      );
    },
    meta: {
      label: 'table.col.status',
      variant: 'select',
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Cancelled', value: 'CANCELLED' }
      ],
      priority: 2,
      mobile: 'badge'
    },
    enableColumnFilter: true,
    enableSorting: true
  };
}

export function createAmountColumn<T extends HasAmountRecord>(amountTitle: string): ColumnDef<T> {
  return {
    id: 'amount',
    accessorKey: 'amount' as keyof T,
    header: ({ column }) => <DataTableColumnHeader column={column} title={amountTitle} />,
    cell: ({ row }) => (
      <span className='font-normal text-foreground'>{formatPkr((row.original as T).amount)}</span>
    ),
    meta: {
      label: 'table.col.amount',
      variant: 'number',
      priority: 1,
      mobile: 'value'
    },
    enableColumnFilter: false,
    enableSorting: true
  };
}
