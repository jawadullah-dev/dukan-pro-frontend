import PageContainer from '@/components/layout/page-container';
import { ProductsListClient } from '@/features/dukaan/components/products';
import { productsQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Products' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(productsQueryOptions({ page: 1, limit: 20 }));
  return (
    <PageContainer
      pageTitle='Products'
      pageDescription='Serialized phones and quantity accessories'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <ProductsListClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
