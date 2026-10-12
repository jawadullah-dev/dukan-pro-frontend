import PageContainer from '@/components/layout/page-container';
import { CustomersListClient, customersQueryOptions } from '@/features/customers';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('customers')
  };
}

export default async function Page() {
  const session = await auth();
  const qc = getQueryClient();

  if (session?.accessToken) {
    await qc.prefetchQuery(
      customersQueryOptions(
        { page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' },
        session.accessToken
      )
    );
  }

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
