import PageContainer from '@/components/layout/page-container';
import { SuppliersListClient } from '@/features/dukaan/components/suppliers';
import { suppliersQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Suppliers' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(suppliersQueryOptions({ limit: 100 }));
  return (
    <PageContainer
      pageTitle='Suppliers'
      pageDescription='Buy-from contacts including Walk-in seller'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <SuppliersListClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
