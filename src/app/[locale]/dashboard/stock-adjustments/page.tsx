import PageContainer from '@/components/layout/page-container';
import { StockAdjustmentsClient, inventoryAdjustmentsQueryOptions } from '@/features/inventory';
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
  void qc.prefetchQuery(inventoryAdjustmentsQueryOptions({ limit: 100 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.adjustments.title'
      pageDescription='pages.adjustments.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <StockAdjustmentsClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
