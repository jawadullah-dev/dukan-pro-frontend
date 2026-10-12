import PageContainer from '@/components/layout/page-container';
import { SupplierPaymentsClient, supplierPaymentsQueryOptions } from '@/features/supplier-payments';
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
  void qc.prefetchQuery(supplierPaymentsQueryOptions({ pageSize: 20 }));

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
