import type { DataTableConfig } from '@/config/data-table';
import type { FilterItemSchema } from '@/lib/parsers';
import type { ColumnSort, Row, RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // biome-ignore lint/correctness/noUnusedVariables: Interface type parameters required by @tanstack/react-table
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    placeholderKey?: string;
    variant?: FilterVariant;
    options?: Option[] | ((t: (key: string) => string) => Option[]);
    range?: [number, number];
    unit?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    /** 1 = always in compact; 4 = widest screens only. Actions ignore this. */
    priority?: 1 | 2 | 3 | 4;
    /** Semantic type for auto mobile layout + detail formatting. */
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
    /** Main identifying column (title slot). */
    primary?: boolean;
    /** Most important number (value slot). */
    highlight?: boolean;
    /** Explicit phone list slot; overrides auto-layout for this column. */
    mobile?: 'title' | 'subtitle' | 'badge' | 'value' | 'meta' | 'hidden';
  }
}

export interface Option {
  label: string;
  value: string;
  count?: number;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export type FilterOperator = DataTableConfig['operators'][number];
export type FilterVariant = DataTableConfig['filterVariants'][number];
export type JoinOperator = DataTableConfig['joinOperators'][number];

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, 'id'> {
  id: Extract<keyof TData, string>;
}

export interface ExtendedColumnFilter<TData> extends FilterItemSchema {
  id: Extract<keyof TData, string>;
}

export interface DataTableRowAction<TData> {
  row: Row<TData>;
  variant: 'update' | 'delete';
}
