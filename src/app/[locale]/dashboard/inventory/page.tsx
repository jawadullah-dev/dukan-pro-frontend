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

import { auth } from '@/auth';

export default async function Page() {
  const session = await auth();
  const token = session?.accessToken;
  const qc = getQueryClient();
  if (token) {
    await qc.prefetchQuery(
      stockQueryOptions({ page: 1, pageSize: 20, sortBy: 'name', sortOrder: 'asc' }, token)
    );
  }
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
