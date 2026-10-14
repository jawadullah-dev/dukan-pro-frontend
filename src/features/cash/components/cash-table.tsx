'use client';

import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { parseAsString, useQueryState } from 'nuqs';
import { useT } from '@/i18n/use-t';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveDataTable,
  type DetailConfig,
  type MobileItemConfig
} from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useDataTable } from '@/hooks/use-data-table';
import { parseBinaryFacet, useDukaanListParams } from '@/components/data-table/list-params';
import { cn } from '@/lib/utils';
import { formatDateTime, formatLabel, formatPkr } from '@/lib/dukaan/numbers';
import type {
  CashMovementDTO,
  CashMovementQueryFilter,
  CashMovementSortField,
  CashMovementType,
  CashDirection,
  CashTableProps
} from '@/types/cash';
import { CASH_TYPE_OPTIONS } from '../constants/cash-constants';
import { cashMovementsQueryOptions } from '../api/queries';
import { OpeningCashDialog } from './opening-cash-dialog';
import { OwnerInvestmentDialog } from './owner-investment-dialog';
import { OwnerWithdrawalDialog } from './owner-withdrawal-dialog';

const cashMobileItem: MobileItemConfig<CashMovementDTO> = {
  title: (row: CashMovementDTO) => formatLabel(row.type),
  subtitle: (row: CashMovementDTO) => row.note || '—',
  value: (row: CashMovementDTO) => {
    const prefix = row.direction === 'OUT' ? '-' : '+';
    return `${prefix}${formatPkr(row.amount)}`;
  },
  valueLabel: (row: CashMovementDTO) => row.direction,
  valueClassName: (row: CashMovementDTO) =>
    row.direction === 'IN'
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-rose-600 dark:text-rose-400',
  badge: (row: CashMovementDTO) => ({
    label: row.direction,
    status: row.direction === 'IN' ? 'ACTIVE' : 'CANCELLED'
  }),
  meta: [(row: CashMovementDTO) => (row.movementDate ? formatDateTime(row.movementDate) : '—')]
};

const cashDetail: DetailConfig<CashMovementDTO> = {
  mode: 'sheet',
  title: (row: CashMovementDTO) => formatLabel(row.type),
  badge: (row: CashMovementDTO) => ({
    label: row.direction,
    status: row.direction === 'IN' ? 'ACTIVE' : 'CANCELLED'
  }),
  value: (row: CashMovementDTO) => formatPkr(row.amount),
  sections: (row: CashMovementDTO) => [
    {
      title: 'Movement Details',
      fields: [
        {
          label: 'When',
          value: row.movementDate ? formatDateTime(row.movementDate) : '—'
        },
        { label: 'Type', value: formatLabel(row.type) },
        { label: 'Direction', value: row.direction },
        { label: 'Amount', value: formatPkr(row.amount) },
        { label: 'Note', value: row.note || '—' },
        { label: 'Overdraft', value: row.isOverdraft ? 'Yes' : 'No' },
        ...(row.referenceType ? [{ label: 'Reference Type', value: row.referenceType }] : []),
        ...(row.referenceId ? [{ label: 'Reference ID', value: row.referenceId }] : []),
        ...(row.reversesMovementId
          ? [{ label: 'Reverses Movement ID', value: row.reversesMovementId }]
          : [])
      ]
    }
  ]
};

export function CashTable({ toolbarAction }: CashTableProps) {
  const t = useT();

  const [openingCashOpen, setOpeningCashOpen] = useState(false);
  const [investmentOpen, setInvestmentOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);

  const sortableColumnIds = ['movementDate', 'amount', 'createdAt'];
  const { params, filters, sortBy, sortOrder, getPageCount } =
    useDukaanListParams<CashMovementSortField>(
      sortableColumnIds,
      'note',
      ['type', 'direction'],
      'movementDate',
      'desc'
    );

  const [searchParam] = useQueryState('search', parseAsString);
  const [noteParam] = useQueryState('note', parseAsString);
  const [typeParam] = useQueryState('type', parseAsString);
  const [directionParam] = useQueryState('direction', parseAsString);

  const search = searchParam || noteParam || undefined;

  const rawType = (filters as Record<string, unknown>).type ?? typeParam;
  let typeFilter: CashMovementType | undefined;
  if (rawType) {
    const parts = Array.isArray(rawType)
      ? (rawType as string[])
      : typeof rawType === 'string'
        ? rawType.split(',')
        : [];
    if (parts.length === 1) {
      typeFilter = parts[0] as CashMovementType;
    }
  }

  const rawDir = (filters as Record<string, unknown>).direction ?? directionParam;
  const directionFilter = parseBinaryFacet<CashDirection>(rawDir, 'IN', 'OUT');

  const queryFilter: CashMovementQueryFilter = {
    page: params.page,
    pageSize: params.perPage,
    ...(search ? { search } : {}),
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(directionFilter ? { direction: directionFilter } : {}),
    sortBy,
    sortOrder
  };

  const { data, isLoading, isFetching } = useQuery(cashMovementsQueryOptions(queryFilter));

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = getPageCount(total);

  const columns: ColumnDef<CashMovementDTO>[] = [
    {
      id: 'movementDate',
      accessorKey: 'movementDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.when')} />,
      cell: ({ row }) => {
        const raw = row.original.movementDate ?? row.original.createdAt;
        return (
          <span className='font-normal text-foreground'>{raw ? formatDateTime(raw) : '—'}</span>
        );
      },
      meta: {
        label: 'table.col.when',
        variant: 'date',
        priority: 2,
        mobile: 'meta'
      },
      enableColumnFilter: false,
      enableSorting: true
    },
    {
      id: 'type',
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.type')} />,
      cell: ({ row }) => (
        <div className='flex items-center gap-1.5'>
          <span className='font-medium text-foreground capitalize'>
            {formatLabel(row.original.type)}
          </span>
          {row.original.isOverdraft && (
            <Badge variant='destructive' className='text-[10px] px-1 py-0 h-4'>
              {t('common.overdraft')}
            </Badge>
          )}
        </div>
      ),
      meta: {
        label: 'table.col.type',
        variant: 'select',
        options: CASH_TYPE_OPTIONS,
        priority: 1,
        mobile: 'title'
      },
      enableColumnFilter: true,
      enableSorting: false
    },
    {
      id: 'direction',
      accessorKey: 'direction',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.dir')} />,
      cell: ({ row }) => {
        const isIncoming = row.original.direction === 'IN';
        return (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center',
              isIncoming
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            )}
          >
            {isIncoming ? 'in' : 'out'}
          </span>
        );
      },
      meta: {
        label: 'table.col.dir',
        variant: 'select',
        options: [
          { label: 'In (IN)', value: 'IN' },
          { label: 'Out (OUT)', value: 'OUT' }
        ],
        priority: 2,
        mobile: 'badge'
      },
      enableColumnFilter: true,
      enableSorting: false
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.amount')} />
      ),
      cell: ({ row }) => {
        const isIncoming = row.original.direction === 'IN';
        return (
          <span
            className={cn(
              'font-medium text-foreground',
              isIncoming
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {isIncoming ? '+' : '-'}
            {formatPkr(row.original.amount)}
          </span>
        );
      },
      meta: {
        label: 'table.col.amount',
        variant: 'number',
        priority: 1,
        mobile: 'value'
      },
      enableColumnFilter: false,
      enableSorting: true
    },
    {
      id: 'note',
      accessorKey: 'note',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.note')} />,
      cell: ({ row }) => {
        const note = row.original.note;
        const rev = row.original.reversesMovementId;
        if (!note && !rev) return <span className='text-muted-foreground'>—</span>;
        return (
          <span className='font-normal text-muted-foreground truncate max-w-[320px] inline-block'>
            {note ?? ''}
            {rev ? (
              <span className='text-amber-600 dark:text-amber-400 font-mono text-xs'>
                {note ? ' · ' : ''}
                {t('table.reverses')} {rev.slice(0, 8)}…
              </span>
            ) : null}
          </span>
        );
      },
      meta: {
        label: 'table.col.note',
        placeholderKey: 'search.cashLedger',
        variant: 'text',
        icon: Icons.search,
        type: 'text',
        primary: true,
        priority: 3,
        mobile: 'subtitle'
      },
      enableColumnFilter: true,
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
      <Button
        type='button'
        size='sm'
        className='h-8 gap-1.5'
        onClick={() => setInvestmentOpen(true)}
      >
        <Icons.add className='h-3.5 w-3.5' />
        <span>{t('common.investCash')}</span>
      </Button>
      <Button
        type='button'
        size='sm'
        variant='outline'
        className='h-8 gap-1.5'
        onClick={() => setWithdrawalOpen(true)}
      >
        <Icons.minus className='h-3.5 w-3.5' />
        <span>{t('common.withdraw')}</span>
      </Button>
      <Button
        type='button'
        size='sm'
        variant='outline'
        className='h-8 gap-1.5'
        onClick={() => setOpeningCashOpen(true)}
      >
        <Icons.wallet className='h-3.5 w-3.5' />
        <span>{t('common.openingBalance')}</span>
      </Button>
    </div>
  );

  return (
    <>
      {openingCashOpen && (
        <OpeningCashDialog open={openingCashOpen} onOpenChange={setOpeningCashOpen} />
      )}

      {investmentOpen && (
        <OwnerInvestmentDialog open={investmentOpen} onOpenChange={setInvestmentOpen} />
      )}

      {withdrawalOpen && (
        <OwnerWithdrawalDialog open={withdrawalOpen} onOpenChange={setWithdrawalOpen} />
      )}

      <ResponsiveDataTable
        table={table}
        toolbarAction={toolbarActionButton}
        mobileItem={cashMobileItem}
        detail={cashDetail}
        isLoading={isLoading || isFetching}
        rowCount={items.length > 0 ? items.length : total > 0 ? total : undefined}
      />
    </>
  );
}
