'use client';

import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState, useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import { getSortingStateParser } from '@/lib/parsers';
import type { ListFilters } from '@/lib/dukaan';

const DUKAAN_PAGE_SIZE_OPTIONS = [20, 30, 50, 100] as const;
export const DUKAAN_DEFAULT_PAGE_SIZE = 20;

function pickFilterValue(values: string[] | null | undefined): string | undefined {
  if (!values?.length) return undefined;
  return values.join(',');
}

export function useDukaanListParams(
  sortableColumnIds: string[],
  searchKey = 'name',
  filterKeys: string[] = []
) {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(DUKAAN_DEFAULT_PAGE_SIZE),
    sort: getSortingStateParser(sortableColumnIds).withDefault([])
  });

  const [search] = useQueryState(searchKey, parseAsString);

  const filterKeysKey = filterKeys.join(',');
  const filterParsers = useMemo(
    () =>
      Object.fromEntries(
        filterKeysKey
          ? filterKeysKey.split(',').map((key) => [key, parseAsArrayOf(parseAsString, ',')])
          : []
      ) as Record<string, ReturnType<typeof parseAsArrayOf<string>>>,
    [filterKeysKey]
  );

  const [facetValues] = useQueryStates(filterParsers);

  const filters: ListFilters = {
    page: params.page,
    limit: params.perPage,
    ...(search && { search }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  };

  for (const key of filterKeys) {
    const value = pickFilterValue(facetValues[key] as string[] | null | undefined);
    if (value) {
      (filters as Record<string, string | number | undefined>)[key] = value;
    }
  }

  return { params, filters, search };
}
