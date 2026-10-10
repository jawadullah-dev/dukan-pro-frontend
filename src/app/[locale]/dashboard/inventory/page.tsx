import PageContainer from '@/components/layout/page-container';
import { InventoryListClient } from '@/features/inventory';
import { stockQueryOptions } from '@/features/inventory';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('inventory')
  };
}

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(stockQueryOptions({ limit: 100 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.inventory.title'
      pageDescription='pages.inventory.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <InventoryListClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
