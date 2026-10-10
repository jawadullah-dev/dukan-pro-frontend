import PageContainer from '@/components/layout/page-container';
import { CustomersListClient } from '@/features/customers';
import { customersQueryOptions } from '@/features/customers';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('customers')
  };
}

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(customersQueryOptions({ limit: 100 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.customers.title'
      pageDescription='pages.customers.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <CustomersListClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
