import PageContainer from '@/components/layout/page-container';
import { CustomersListClient } from '@/features/dukaan/components/customers';
import { customersQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Customers' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(customersQueryOptions({ limit: 100 }));
  return (
    <PageContainer pageTitle='Customers' pageDescription='Customer list and Udhar'>
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <CustomersListClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
