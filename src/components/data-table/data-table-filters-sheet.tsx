'use client';

import * as React from 'react';
import type { Column, Table } from '@tanstack/react-table';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DataTableFacetedFilter } from '@/components/ui/table/data-table-faceted-filter';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface DataTableFiltersSheetProps<TData> {
  table: Table<TData>;
  open: boolean;
  onOpenChange: (open: boolean) => void;

  pageSizeOptions?: number[];
}

export function DataTableFiltersSheet<TData>({
  table,
  open,
  onOpenChange,
  pageSizeOptions = [20, 30, 50, 100]
}: DataTableFiltersSheetProps<TData>) {
  const t = useTranslations();
  const filterColumns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            column.getCanFilter() &&
            column.columnDef.meta?.variant &&
            column.columnDef.meta.variant !== 'text'
        ),
    [table]
  );

  const sortable = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanSort() && column.id !== 'actions'),
    [table]
  );

  const sorting = table.getState().sorting[0];
  const sortValue = sorting ? `${sorting.id}:${sorting.desc ? 'desc' : 'asc'}` : '';

  const onClear = () => {
    table.resetColumnFilters();
    table.resetSorting();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='bottom'
        className={cn(
          'max-h-[85dvh] gap-0 rounded-t-[var(--radius)] pb-[max(1rem,env(safe-area-inset-bottom))]'
        )}
      >
        <div className='bg-muted mx-auto mt-1 mb-2 h-1 w-10 shrink-0 rounded-full' aria-hidden />
        <SheetHeader>
          <SheetTitle>{t('table.filters')}</SheetTitle>
        </SheetHeader>

        <div className='no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-2'>
          {sortable.length > 0 ? (
            <div className='grid gap-2'>
              <Label htmlFor='table-sort'>{t('table.sortBy')}</Label>
              <Select
                items={[
                  { value: '__none__', label: '—' },
                  ...sortable.flatMap((column) => {
                    const label = column.columnDef.meta?.label ?? column.id;
                    return [
                      { value: `${column.id}:asc`, label: `${label} ↑` },
                      { value: `${column.id}:desc`, label: `${label} ↓` }
                    ];
                  })
                ]}
                value={sortValue || '__none__'}
                onValueChange={(value) => {
                  if (!value || value === '__none__') {
                    table.setSorting([]);
                    return;
                  }
                  const [id, dir] = value.split(':');
                  if (!id) return;
                  table.setSorting([{ id, desc: dir === 'desc' }]);
                }}
              >
                <SelectTrigger id='table-sort' className='h-11 w-full'>
                  <SelectValue placeholder={t('table.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='__none__'>—</SelectItem>
                    {sortable.map((column) => {
                      const label = column.columnDef.meta?.label ?? column.id;
                      return (
                        <React.Fragment key={column.id}>
                          <SelectItem value={`${column.id}:asc`}>{label} ↑</SelectItem>
                          <SelectItem value={`${column.id}:desc`}>{label} ↓</SelectItem>
                        </React.Fragment>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {filterColumns.map((column) => (
            <FilterBlock key={column.id} column={column} />
          ))}

          <div className='grid gap-2'>
            <Label htmlFor='table-page-size'>{t('table.rowsPerPage')}</Label>
            <Select
              items={pageSizeOptions.map((size) => ({
                value: `${size}`,
                label: `${size}`
              }))}
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                if (value != null) table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger id='table-page-size' className='h-11 w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className='flex-row gap-2 px-4'>
          <Button type='button' variant='outline' className='h-11 flex-1' onClick={onClear}>
            {t('table.clear')}
          </Button>
          <Button type='button' className='h-11 flex-1' onClick={() => onOpenChange(false)}>
            {t('table.apply')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface FilterBlockProps<TData> {
  column: Column<TData, unknown>;
}

function FilterBlock<TData>({ column }: FilterBlockProps<TData>) {
  const t = useTranslations();
  const meta = column.columnDef.meta;
  if (!meta?.variant) return null;

  if (meta.variant === 'select' || meta.variant === 'multiSelect') {
    const options =
      typeof meta.options === 'function'
        ? meta.options((key: string) => t(key))
        : (meta.options ?? []);
    return (
      <div className='grid gap-2'>
        <Label>{meta.label ?? column.id}</Label>
        <DataTableFacetedFilter
          column={column}
          title={meta.label ?? column.id}
          options={options}
          multiple={meta.variant === 'multiSelect'}
        />
      </div>
    );
  }

  return null;
}
