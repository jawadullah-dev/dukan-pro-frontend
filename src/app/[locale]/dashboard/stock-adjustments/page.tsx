import PageContainer from '@/components/layout/page-container';
import { StockAdjustmentsClient, inventoryAdjustmentsQueryOptions } from '@/features/inventory';
import { productsQueryOptions } from '@/features/products';
import { unitsQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('stockAdjustments')
  };
}

export default async function Page() {
  const session = await auth();
  const token = session?.accessToken;
  const qc = getQueryClient();

  if (token) {
    await qc.prefetchQuery(
      inventoryAdjustmentsQueryOptions(
        { page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' },
        token
      )
    );
  }
  void qc.prefetchQuery(productsQueryOptions({ page: 1, pageSize: 100 }, token));
  void qc.prefetchQuery(unitsQueryOptions());

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
