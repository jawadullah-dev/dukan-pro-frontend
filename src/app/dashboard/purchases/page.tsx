import PageContainer from '@/components/layout/page-container';
import { PurchasesListClient } from '@/features/dukaan/components/purchases';
import { purchasesQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Purchases' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(purchasesQueryOptions({ limit: 100 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.purchases.title'
      pageDescription='pages.purchases.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <PurchasesListClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
