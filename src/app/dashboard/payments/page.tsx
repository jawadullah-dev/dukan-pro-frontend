import PageContainer from '@/components/layout/page-container';
import { PaymentsClient } from '@/features/dukaan/components/payments';
import { paymentsQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Payments' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(paymentsQueryOptions({ limit: 100 }));
  return (
    <PageContainer
      pageTitle='Payments'
      pageDescription='Customer payments — cancel with reason (owner only)'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <PaymentsClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
