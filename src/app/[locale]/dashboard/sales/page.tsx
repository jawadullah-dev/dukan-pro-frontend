import PageContainer from '@/components/layout/page-container';
import { SalesListClient } from '@/features/sales';
import { salesQueryOptions } from '@/features/sales';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('sales')
  };
}

export default async function Page() {
  const session = await auth();
  const token = session?.accessToken;
  const qc = getQueryClient();
  if (token) {
    await qc.prefetchQuery(
      salesQueryOptions({ page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' }, token)
    );
  }

  return (
    <PageContainer fill pageTitle='pages.sales.title' pageDescription='pages.sales.description'>
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <SalesListClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
