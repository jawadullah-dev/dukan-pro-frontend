import PageContainer from '@/components/layout/page-container';
import { SalesListClient } from '@/features/dukaan/components/sales';
import { salesQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Sales' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(salesQueryOptions({ limit: 100 }));
  return (
    <PageContainer fill pageTitle='Sales' pageDescription='Cash, part payment, and Udhar sales'>
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <SalesListClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
