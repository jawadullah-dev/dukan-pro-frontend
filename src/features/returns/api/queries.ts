import { queryOptions } from '@tanstack/react-query';
import { listReturns, getReturnPreview } from './service';

export const returnKeys = {
  all: ['returns'] as const,
  lists: () => [...returnKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...returnKeys.lists(), filters] as const,
  preview: (saleId: string) => [...returnKeys.all, 'preview', saleId] as const
};

export const returnsQueryOptions = (filters: Record<string, any> = {}) =>
  queryOptions({
    queryKey: returnKeys.list(filters),
    queryFn: () => listReturns(filters)
  });

export const returnPreviewQueryOptions = (saleId: string) =>
  queryOptions({
    queryKey: returnKeys.preview(saleId),
    queryFn: () => getReturnPreview(saleId)
  });
