import type { DataTableConfig } from '@/config/data-table';
import type { FilterItemSchema } from '@/lib/parsers';
import type { ColumnSort, Row, RowData } from '@tanstack/react-table';

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

type FilterOperator = DataTableConfig['operators'][number];
export type FilterVariant = DataTableConfig['filterVariants'][number];
type JoinOperator = DataTableConfig['joinOperators'][number];

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, 'id'> {
  id: Extract<keyof TData, string>;
}

export interface ExtendedColumnFilter<TData> extends FilterItemSchema {
  id: Extract<keyof TData, string>;
}

interface DataTableRowAction<TData> {
  row: Row<TData>;
  variant: 'update' | 'delete';
}

export * from '@/components/data-table/types';
