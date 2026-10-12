import PageContainer from '@/components/layout/page-container';
import { PaymentsClient, paymentsQueryOptions } from '@/features/payments';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('payments')
  };
}

export default async function Page() {
  const session = await auth();
  const token = session?.accessToken;
  const qc = getQueryClient();
  if (token) {
    await qc.prefetchQuery(
      paymentsQueryOptions(
        { page: 1, pageSize: 20, sortBy: 'paymentDate', sortOrder: 'desc' },
        token
      )
    );
  }

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
