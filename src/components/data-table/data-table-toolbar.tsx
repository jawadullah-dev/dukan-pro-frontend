'use client';

import * as React from 'react';
import type { Column, Table } from '@tanstack/react-table';
import { DataTableDateFilter } from '@/components/ui/table/data-table-date-filter';
import { DataTableFacetedFilter } from '@/components/ui/table/data-table-faceted-filter';
import { DataTableSliderFilter } from '@/components/ui/table/data-table-slider-filter';
import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { DataTableFiltersSheet } from './data-table-filters-sheet';
import type { ContainerMode, DataTableToolbarProps, DataTableToolbarFilterProps } from './types';

export function DataTableToolbar<TData>({
  table,
  mode,
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const t = useTranslations();
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const isFiltered = table.getState().columnFilters.length > 0;
  const filterCount =
    table.getState().columnFilters.length + (table.getState().sorting.length > 0 ? 1 : 0);

  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table]
  );

  const textColumn = columns.find((column) => column.columnDef.meta?.variant === 'text');
  const phoneMode = mode === 'list' || mode === 'cards';

  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
  }, [table]);

  if (phoneMode) {
    return (
      <div
        role='toolbar'
        className={cn(
          'bg-background/95 sticky top-0 z-10 -mx-1 flex shrink-0 flex-col gap-2 border-b border-border/60 px-1 py-2 backdrop-blur-md',
          className
        )}
        {...props}
      >
        <div className='flex items-center gap-2'>
          {textColumn ? (
            <Input
              placeholder={(() => {
                const pk = textColumn.columnDef.meta?.placeholderKey;
                if (pk) {
                  try {
                    return (t as (k: string) => string)(pk);
                  } catch {
                    return pk;
                  }
                }
                return (
                  textColumn.columnDef.meta?.placeholder ??
                  textColumn.columnDef.meta?.label ??
                  t('table.search')
                );
              })()}
              aria-label={textColumn.columnDef.meta?.label ?? t('table.search')}
              value={(textColumn.getFilterValue() as string) ?? ''}
              onChange={(event) => textColumn.setFilterValue(event.target.value)}
              className='h-11 min-h-11 flex-1'
            />
          ) : null}
          <Button
            type='button'
            variant='outline'
            className='relative h-11 shrink-0 gap-1.5 px-3'
            onClick={() => setFiltersOpen(true)}
            aria-label={t('table.filters')}
          >
            <Icons.adjustments className='size-4' />
            {t('table.filters')}
            {filterCount > 0 ? (
              <Badge variant='secondary' className='ms-0.5 h-5 min-w-5 px-1'>
                {filterCount}
              </Badge>
            ) : null}
          </Button>
        </div>
        <DataTableFiltersSheet table={table} open={filtersOpen} onOpenChange={setFiltersOpen} />
      </div>
    );
  }

  return (
    <div
      role='toolbar'
      aria-orientation='horizontal'
      className={cn('flex w-full items-start justify-between gap-2 p-1', className)}
      {...props}
    >
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        {columns.map((column) => (
          <DataTableToolbarFilter key={column.id} column={column} />
        ))}
        {isFiltered && (
          <Button
            type='button'
            aria-label={t('table.resetFilters')}
            variant='outline'
            size='sm'
            className='border-dashed'
            onClick={onReset}
          >
            <Icons.close />
            {t('table.clear')}
          </Button>
        )}
      </div>
      <div className='flex items-center gap-2'>
        {mode === 'full' ? <DataTableViewOptions table={table} /> : null}
        {children}
      </div>
    </div>
  );
}

function DataTableToolbarFilter<TData>({ column }: DataTableToolbarFilterProps<TData>) {
  const t = useTranslations();
  const translate = (k: string) => {
    try {
      return (t as (key: string) => string)(k);
    } catch {
      return k;
    }
  };
  const columnMeta = column.columnDef.meta;
  if (!columnMeta?.variant) return null;

  const getLabel = (label: string) => {
    if (label.includes('.')) {
      try {
        return translate(label);
      } catch {
        return label;
      }
    }
    return label;
  };

  const label = columnMeta.label ? getLabel(columnMeta.label) : column.id;

  switch (columnMeta.variant) {
    case 'text':
      return (
        <Input
          placeholder={
            (columnMeta.placeholderKey
              ? translate(columnMeta.placeholderKey)
              : columnMeta.placeholder) ?? label
          }
          aria-label={label ?? t('table.search')}
          value={(column.getFilterValue() as string) ?? ''}
          onChange={(event) => column.setFilterValue(event.target.value)}
          className='h-8 w-40 lg:w-56'
        />
      );
    case 'number':
      return (
        <div className='relative'>
          <Input
            type='number'
            inputMode='numeric'
            placeholder={
              (columnMeta.placeholderKey
                ? translate(columnMeta.placeholderKey)
                : columnMeta.placeholder) ?? label
            }
            aria-label={label ?? t('table.search')}
            value={(column.getFilterValue() as string) ?? ''}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className={cn('h-8 w-[120px]', columnMeta.unit && 'pe-8')}
          />
          {columnMeta.unit ? (
            <span className='bg-accent text-muted-foreground absolute end-0 top-0 bottom-0 flex items-center rounded-e-md px-2 text-sm'>
              {columnMeta.unit}
            </span>
          ) : null}
        </div>
      );
    case 'range':
      return <DataTableSliderFilter column={column} title={label} />;
    case 'date':
    case 'dateRange':
      return (
        <DataTableDateFilter
          column={column}
          title={label}
          multiple={columnMeta.variant === 'dateRange'}
        />
      );
    case 'select':
    case 'multiSelect':
      return (
        <DataTableFacetedFilter
          column={column}
          title={label}
          options={
            typeof columnMeta.options === 'function'
              ? columnMeta.options(translate)
              : (columnMeta.options ?? [])
          }
          multiple={columnMeta.variant === 'multiSelect'}
        />
      );
    default:
      return null;
  }
}
