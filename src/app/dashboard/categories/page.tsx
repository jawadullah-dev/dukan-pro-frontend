import PageContainer from '@/components/layout/page-container';
import { CategoriesPageClient } from '@/features/dukaan/components/catalog-simple';
import { categoriesQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Categories' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(categoriesQueryOptions({ page: 1, limit: 20 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.categories.title'
      pageDescription='pages.categories.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <CategoriesPageClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
