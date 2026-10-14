import { createParser } from 'nuqs/server';
import { z } from 'zod';

import { dataTableConfig } from '@/config/data-table';

import type { IdKeyed } from '@/types/common';
import type { ExtendedColumnFilter, ExtendedColumnSort } from '@/types/data-table';

const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean()
});

function parseJsonArrayWithSchema<T extends IdKeyed>(
  value: string,
  schema: z.ZodTypeAny,
  validKeys: Set<string> | null
): T[] | null {
  try {
    const parsed = JSON.parse(value);
    const result = z.array(schema).safeParse(parsed);
    if (!result.success) return null;
    if (validKeys && (result.data as IdKeyed[]).some((item) => !validKeys.has(item.id))) {
      return null;
    }
    return result.data as T[];
  } catch {
    return null;
  }
}

export const getSortingStateParser = <TData>(columnIds?: string[] | Set<string>) => {
  const validKeys = columnIds ? (columnIds instanceof Set ? columnIds : new Set(columnIds)) : null;

  return createParser({
    parse: (value) =>
      parseJsonArrayWithSchema<ExtendedColumnSort<TData>>(value, sortingItemSchema, validKeys),
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every((item, index) => item.id === b[index]?.id && item.desc === b[index]?.desc)
  });
};

const filterItemSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  variant: z.enum(dataTableConfig.filterVariants),
  operator: z.enum(dataTableConfig.operators),
  filterId: z.string()
});

export type FilterItemSchema = z.infer<typeof filterItemSchema>;

const getFiltersStateParser = <TData>(columnIds?: string[] | Set<string>) => {
  const validKeys = columnIds ? (columnIds instanceof Set ? columnIds : new Set(columnIds)) : null;

  return createParser({
    parse: (value) =>
      parseJsonArrayWithSchema<ExtendedColumnFilter<TData>>(value, filterItemSchema, validKeys),
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (filter, index) =>
          filter.id === b[index]?.id &&
          filter.value === b[index]?.value &&
          filter.variant === b[index]?.variant &&
          filter.operator === b[index]?.operator
      )
  });
};
