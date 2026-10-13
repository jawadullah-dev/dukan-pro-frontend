'use client';

import { useQuery } from '@tanstack/react-query';

import type { PaginatedResponse, ProductDTO, ProductListFilters } from '@/lib/api/types';
import { productsQueryOptions } from '@/features/products/api/queries';

export function useProducts(
  filters: ProductListFilters = {},
  initialData?: PaginatedResponse<ProductDTO>
) {
  const query = useQuery({
    ...productsQueryOptions(filters),
    initialData: initialData,
    staleTime: 1000
  });
  const data = query.data ??
    initialData ?? {
      items: [],
      total: 0,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 10
    };
  return { data, isLoading: query.isLoading, isFetching: query.isFetching };
}
