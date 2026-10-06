import PageContainer from '@/components/layout/page-container';
import { BrandsPageClient } from '@/features/dukaan/components/catalog-simple';
import { brandsQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Brands' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(brandsQueryOptions({ page: 1, limit: 20 }));
  return (
    <PageContainer fill pageTitle='pages.brands.title' pageDescription='pages.brands.description'>
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <BrandsPageClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
