import PageContainer from '@/components/layout/page-container';
import { InventoryListClient } from '@/features/dukaan/components/money-stock';
import { stockQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Inventory' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(stockQueryOptions({ limit: 100 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.inventory.title'
      pageDescription='Current stock levels and IMEIs in stock'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <InventoryListClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
