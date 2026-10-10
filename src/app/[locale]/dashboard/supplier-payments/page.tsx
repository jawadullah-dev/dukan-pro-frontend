import PageContainer from '@/components/layout/page-container';
import { SupplierPaymentsClient } from '@/features/cash';
import { supplierPaymentsQueryOptions } from '@/features/dukaan/api/queries';
import { suppliersQueryOptions } from '@/features/suppliers';
import { purchasesQueryOptions } from '@/features/purchases';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('supplierPayments')
  };
}

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
