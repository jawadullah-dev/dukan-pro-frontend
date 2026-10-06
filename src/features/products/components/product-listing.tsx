import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { TablePageBody } from '@/components/layout/table-page-body';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { productsQueryOptions } from '../api/queries';
import { ProductTable } from './product-tables';

export default function ProductListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const categories = searchParamsCache.get('category');
  const sort = searchParamsCache.get('sort');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(categories && { categories }),
    ...(sort && { sort })
  };

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(productsQueryOptions(filters));

  return (
    <TablePageBody>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductTable />
      </HydrationBoundary>
    </TablePageBody>
  );
}
