'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { parseAsString, useQueryState } from 'nuqs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDataTable,
  type DetailConfig,
  type MobileItemConfig,
  type QuickFilterChip
} from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { useDataTable } from '@/hooks/use-data-table';
import { Icons } from '@/components/icons';
import { IconPlus } from '@tabler/icons-react';
import { useT } from '@/i18n/use-t';
import { DUKAAN_DEFAULT_PAGE_SIZE, useDukaanListParams } from '@/components/data-table/list-params';
import { formatLabel } from '@/lib/dukaan/numbers';
import type { InventoryAdjustmentDTO } from '@/lib/api/types';
import type { AdjustmentsTableProps } from '@/types/inventory';
import { inventoryAdjustmentsQueryOptions } from '../api/queries';
import { StockAdjustDialog } from './stock-adjust-dialog';

const TYPE_OPTIONS = [
  { label: 'Adjustment', value: 'ADJUSTMENT' },
  { label: 'Damaged', value: 'DAMAGED' },
  { label: 'Lost', value: 'LOST' }
];

export function AdjustmentsTable({ toolbarAction }: AdjustmentsTableProps) {
  const t = useT();
  const [adjustOpen, setAdjustOpen] = useState(false);

  const sortableColumnIds = ['createdAt', 'quantityChange'];
  const { params, filters } = useDukaanListParams(sortableColumnIds, 'createdAt', ['type']);

  const [searchParam] = useQueryState('search', parseAsString);
  const [typeParam] = useQueryState('type', parseAsString);

  const rawType = (filters as Record<string, unknown>).type ?? typeParam;
  let typeFilter: 'ADJUSTMENT' | 'DAMAGED' | 'LOST' | undefined;
  if (rawType) {
    const arr = Array.isArray(rawType)
      ? (rawType as string[])
      : typeof rawType === 'string'
        ? rawType.split(',')
        : [];
    if (
      arr.length === 1 &&
      (arr[0] === 'ADJUSTMENT' || arr[0] === 'DAMAGED' || arr[0] === 'LOST')
    ) {
      typeFilter = arr[0];
    }
  }

  const sortItem = params.sort[0];
  let sortBy: 'createdAt' | 'quantityChange' = 'createdAt';
  let sortOrder: 'asc' | 'desc' = 'desc';

  if (sortItem && sortableColumnIds.includes(sortItem.id)) {
    sortBy = sortItem.id as typeof sortBy;
    sortOrder = sortItem.desc ? 'desc' : 'asc';
  }

  const { data, isLoading } = useQuery(
    inventoryAdjustmentsQueryOptions({
      page: params.page,
      pageSize: params.perPage,
      search: searchParam || undefined,
      type: typeFilter,
      sortBy,
      sortOrder
    })
  );

  const items = data?.items ?? [];
  const total = data?.total ?? items.length;
  const pageCount = Math.max(1, Math.ceil(total / params.perPage));

  const columns: ColumnDef<InventoryAdjustmentDTO>[] = [
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.date')} />,
      cell: ({ row }) => {
        const val = row.original.createdAt;
        const formatted = val ? val.split('T')[0] : '—';
        return <span className='font-normal text-foreground'>{formatted}</span>;
      },
      meta: {
        label: 'table.col.date',
        variant: 'date',
        priority: 2,
        mobile: 'meta'
      },
      enableColumnFilter: false,
      enableSorting: true
    },
    {
      id: 'productName',
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.product')} />
      ),
      cell: ({ row }) => (
        <div className='flex flex-col gap-0.5'>
          <span className='font-normal text-foreground'>{row.original.productName}</span>
          {row.original.imei && (
            <span className='font-mono text-xs text-muted-foreground'>
              {t('inventory.imeiLabel')} {row.original.imei}
            </span>
          )}
        </div>
      ),
      meta: {
        label: 'table.col.product',
        placeholderKey: 'search.adjustments',
        variant: 'text',
        icon: Icons.search,
        type: 'text',
        primary: true,
        priority: 1,
        mobile: 'title'
      },
      enableColumnFilter: true,
      enableSorting: false
    },
    {
      id: 'type',
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.col.type')} />,
      cell: ({ row }) => {
        const type = row.original.type;
        const colorClass =
          type === 'ADJUSTMENT'
            ? 'border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10'
            : type === 'DAMAGED'
              ? 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10'
              : 'border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/10';
        return (
          <Badge variant='outline' className={colorClass}>
            {formatLabel(type)}
          </Badge>
        );
      },
      meta: {
        label: 'table.col.type',
        variant: 'select',
        options: TYPE_OPTIONS,
        priority: 2,
        mobile: 'badge'
      },
      enableColumnFilter: true,
      enableSorting: false
    },
    {
      id: 'quantityChange',
      accessorKey: 'quantityChange',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.qtyDelta')} />
      ),
      cell: ({ row }) => {
        const change = row.original.quantityChange;
        const isPositive = change > 0;
        return (
          <span
            className={
              isPositive
                ? 'font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums'
                : 'font-semibold text-rose-600 dark:text-rose-400 tabular-nums'
            }
          >
            {isPositive ? `+${change}` : change}
          </span>
        );
      },
      meta: {
        label: 'table.col.qty',
        variant: 'number',
        priority: 1,
        mobile: 'value'
      },
      enableColumnFilter: false,
      enableSorting: true
    },
    {
      id: 'reason',
      accessorKey: 'reason',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.col.reason')} />
      ),
      cell: ({ row }) => (
        <span className='font-normal text-foreground truncate max-w-xs block'>
          {row.original.reason || '—'}
        </span>
      ),
      meta: {
        label: 'table.col.reason',
        variant: 'text',
        priority: 3,
        mobile: 'subtitle'
      },
      enableColumnFilter: false,
      enableSorting: false
    }
  ];

  const mobileItem: MobileItemConfig<InventoryAdjustmentDTO> = {
    leading: 'icon',
    leadingIcon: Icons.adjustments,
    title: (row) => row.productName,
    subtitle: (row) => row.reason || formatLabel(row.type),
    badge: (row) => ({
      label: formatLabel(row.type),
      status: row.type === 'ADJUSTMENT' ? 'ACTIVE' : 'OVERDUE'
    }),
    value: (row) => (row.quantityChange > 0 ? `+${row.quantityChange}` : `${row.quantityChange}`),
    meta: [(row) => (row.createdAt ? row.createdAt.split('T')[0] : '—')],
    ariaLabel: (row) => `${row.productName}, ${row.type}, ${row.quantityChange}`
  };

  const detail: DetailConfig<InventoryAdjustmentDTO> = {
    mode: 'sheet',
    title: (row) => row.productName,
    badge: (row) => ({
      label: formatLabel(row.type),
      status: row.type === 'ADJUSTMENT' ? 'ACTIVE' : 'OVERDUE'
    }),
    value: (row) =>
      row.quantityChange > 0 ? `+${row.quantityChange} units` : `${row.quantityChange} units`,
    sections: (row) => [
      {
        title: 'Adjustment Details',
        fields: [
          { label: 'Product', value: row.productName },
          { label: 'Date', value: row.createdAt ? row.createdAt.split('T')[0] : '—' },
          { label: 'Type', value: formatLabel(row.type) },
          {
            label: 'Quantity Change',
            value: row.quantityChange > 0 ? `+${row.quantityChange}` : `${row.quantityChange}`
          },
          ...(row.imei ? [{ label: 'IMEI', value: row.imei }] : []),
          { label: 'Reason', value: row.reason || '—' }
        ]
      }
    ]
  };

  const quickFilters: QuickFilterChip[] = [
    { id: 'all', label: t('table.all') },
    {
      id: 'adjustment',
      label: 'Adjustment',
      columnId: 'type',
      value: ['ADJUSTMENT']
    },
    {
      id: 'damaged',
      label: 'Damaged',
      columnId: 'type',
      value: ['DAMAGED']
    },
    {
      id: 'lost',
      label: 'Lost',
      columnId: 'type',
      value: ['LOST']
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
      pagination: { pageIndex: 0, pageSize: DUKAAN_DEFAULT_PAGE_SIZE }
    }
  });

  return (
    <>
      <ResponsiveDataTable
        table={table}
        toolbarAction={
          toolbarAction ?? (
            <Button size='sm' onClick={() => setAdjustOpen(true)}>
              <IconPlus className='me-1.5 h-4 w-4' />
              {t('common.adjustStock')}
            </Button>
          )
        }
        mobileItem={mobileItem}
        detail={detail}
        quickFilters={quickFilters}
        isLoading={isLoading}
      />

      {adjustOpen && <StockAdjustDialog open={adjustOpen} onOpenChange={setAdjustOpen} />}
    </>
  );
}
