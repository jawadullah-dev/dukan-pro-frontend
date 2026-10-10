import PageContainer from '@/components/layout/page-container';
import { SalesListClient } from '@/features/sales';
import { salesQueryOptions } from '@/features/sales';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('sales')
  };
}

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(salesQueryOptions({ limit: 100 }));
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
