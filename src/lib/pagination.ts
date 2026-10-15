import type { PaginatedResponse } from '@/lib/api/types';

export function getNextPageParam<T>(lastPage: PaginatedResponse<T>): number | undefined {
  const loaded = lastPage.page * lastPage.pageSize;
  return loaded < lastPage.total ? lastPage.page + 1 : undefined;
}
