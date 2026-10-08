import PageContainer from '@/components/layout/page-container';
import { CustomerLedgerClient } from '@/features/dukaan/components/customers';
import { customerQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('customerLedger')
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const qc = getQueryClient();
  void qc.prefetchQuery(customerQueryOptions(id));
  return (
    <PageContainer
      pageTitle='pages.customerLedger.title'
      pageDescription='pages.customerLedger.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <CustomerLedgerClient id={id} />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
