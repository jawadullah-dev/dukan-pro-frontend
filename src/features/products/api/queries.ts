import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';

import type { ProductListFilters } from '@/lib/api/types';

import { getProduct, listProductImages, listProducts } from './service';

export const productsQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productsQueryKeys.all, 'list'] as const,
  list: (filters: ProductListFilters = {}) => [...productsQueryKeys.lists(), filters] as const,
  details: () => [...productsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsQueryKeys.details(), id] as const,
  images: () => [...productsQueryKeys.all, 'images'] as const,
  imageList: (productId: string) => [...productsQueryKeys.images(), productId] as const
};

export function productsQueryOptions(filters: ProductListFilters = {}, token?: string) {
  return queryOptions({
    queryKey: productsQueryKeys.list(filters),
    queryFn: () => listProducts(filters, token),
    placeholderData: keepPreviousData
  });
}

export function productQueryOptions(id: string, token?: string) {
  return queryOptions({
    queryKey: productsQueryKeys.detail(id),
    queryFn: () => getProduct(id, token),
    enabled: !!id
  });
}

export function productImagesQueryOptions(productId: string, token?: string) {
  return queryOptions({
    queryKey: productsQueryKeys.imageList(productId),
    queryFn: () => listProductImages(productId, token),
    enabled: !!productId
  });
}

export function useProductImagesQuery(
  productId: string,
  token?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    ...productImagesQueryOptions(productId, token),
    enabled: (options?.enabled ?? true) && !!productId
  });
}
