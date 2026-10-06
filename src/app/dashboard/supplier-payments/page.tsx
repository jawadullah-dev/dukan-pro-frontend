import PageContainer from '@/components/layout/page-container';
import { SupplierPaymentsClient } from '@/features/dukaan/components/money-stock';
import {
  purchasesQueryOptions,
  supplierPaymentsQueryOptions,
  suppliersQueryOptions
} from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Supplier payments' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(supplierPaymentsQueryOptions({ limit: 100 }));
  void qc.prefetchQuery(suppliersQueryOptions({ limit: 100 }));
  void qc.prefetchQuery(purchasesQueryOptions({ limit: 100 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.supplierPayments.title'
      pageDescription='pages.supplierPayments.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <SupplierPaymentsClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
