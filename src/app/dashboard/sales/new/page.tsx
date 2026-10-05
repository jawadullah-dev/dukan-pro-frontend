import PageContainer from '@/components/layout/page-container';
import { SalesListClient } from '@/features/dukaan/components/sales';
import {
  customersQueryOptions,
  productsQueryOptions,
  salesQueryOptions,
  unitsQueryOptions
} from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: New sale' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(salesQueryOptions({ limit: 100 }));
  void qc.prefetchQuery(productsQueryOptions({ limit: 100 }));
  void qc.prefetchQuery(customersQueryOptions({ limit: 100 }));
  void qc.prefetchQuery(unitsQueryOptions());
  return (
    <PageContainer pageTitle='Sales' pageDescription='Cash, part payment, and Udhar sales'>
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <SalesListClient defaultOpenAdd />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
