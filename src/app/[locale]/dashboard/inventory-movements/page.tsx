import PageContainer from '@/components/layout/page-container';
import { InventoryMovementsClient } from '@/features/inventory';
import { inventoryMovementsQueryOptions } from '@/features/inventory';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('inventoryMovements')
  };
}

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(inventoryMovementsQueryOptions({ limit: 100 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.movements.title'
      pageDescription='pages.movements.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <InventoryMovementsClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
