import PageContainer from '@/components/layout/page-container';
import { CustomerLedgerClient } from '@/features/customers';
import { customerQueryOptions } from '@/features/customers';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import type { IdPageProps } from '@/types';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('customerLedger')
  };
}

export default async function Page({ params }: IdPageProps) {
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
