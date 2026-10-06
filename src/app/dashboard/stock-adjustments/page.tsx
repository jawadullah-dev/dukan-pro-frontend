import PageContainer from '@/components/layout/page-container';
import { StockAdjustForm } from '@/features/dukaan/components/money-stock';
import { productsQueryOptions, unitsQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Stock adjustments' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(productsQueryOptions({ limit: 100 }));
  void qc.prefetchQuery(unitsQueryOptions());
  return (
    <PageContainer
      pageTitle='Stock adjustments'
      pageDescription='Adjustment, damaged, or lost with reason'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <StockAdjustForm />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
