import PageContainer from '@/components/layout/page-container';
import { StockAdjustForm } from '@/features/dukaan/components/money-stock';
import { productsQueryOptions, unitsQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('stockAdjustments')
  };
}

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(productsQueryOptions({ limit: 100 }));
  void qc.prefetchQuery(unitsQueryOptions());
  return (
    <PageContainer
      pageTitle='pages.adjustments.title'
      pageDescription='pages.adjustments.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <StockAdjustForm />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
