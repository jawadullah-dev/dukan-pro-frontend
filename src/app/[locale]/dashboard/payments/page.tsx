import PageContainer from '@/components/layout/page-container';
import { PaymentsClient } from '@/features/cash';
import { paymentsQueryOptions } from '@/features/cash';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('payments')
  };
}

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(paymentsQueryOptions({ limit: 100 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.payments.title'
      pageDescription='pages.payments.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <PaymentsClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
