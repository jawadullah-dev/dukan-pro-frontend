import PageContainer from '@/components/layout/page-container';
import { InventoryMovementsClient } from '@/features/dukaan/components/money-stock';
import { inventoryMovementsQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Inventory Movements' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(inventoryMovementsQueryOptions({ limit: 100 }));
  return (
    <PageContainer
      fill
      pageTitle='Inventory movements'
      pageDescription='Append-only stock movement history'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <InventoryMovementsClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
