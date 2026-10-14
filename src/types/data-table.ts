import type * as React from 'react';
import type { DataTableConfig } from '@/config/data-table';
import type { ColumnSort, RowData, TableOptions, TableState } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    placeholderKey?: string;
    variant?: FilterVariant;
    options?: Option[] | ((t: (key: string) => string) => Option[]);
    range?: [number, number];
    unit?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;

    priority?: 1 | 2 | 3 | 4;

    type?:
      | 'text'
      | 'id'
      | 'phone'
      | 'money'
      | 'number'
      | 'date'
      | 'status'
      | 'boolean'
      | 'image'
      | 'longtext';

    primary?: boolean;

    highlight?: boolean;

    mobile?: 'title' | 'subtitle' | 'badge' | 'value' | 'meta' | 'hidden';
  }
}

export interface Option {
  label: string;
  value: string;
  count?: number;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export type FilterVariant = DataTableConfig['filterVariants'][number];

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, 'id'> {
  id: Extract<keyof TData, string>;
}

export interface DataTableInitialState<TData> extends Omit<Partial<TableState>, 'sorting'> {
  sorting?: ExtendedColumnSort<TData>[];
}

export interface UseDataTableProps<TData>
  extends
    Omit<
      TableOptions<TData>,
      | 'state'
      | 'pageCount'
      | 'getCoreRowModel'
      | 'manualFiltering'
      | 'manualPagination'
      | 'manualSorting'
    >,
    Required<Pick<TableOptions<TData>, 'pageCount'>> {
  initialState?: DataTableInitialState<TData>;
  history?: 'push' | 'replace';
  debounceMs?: number;
  throttleMs?: number;
  clearOnDefault?: boolean;
  enableAdvancedFilter?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  startTransition?: React.TransitionStartFunction;
}

export * from '@/components/data-table/types';
