import PageContainer from '@/components/layout/page-container';
import { PurchasesListClient } from '@/features/purchases';
import { purchasesQueryOptions } from '@/features/purchases';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('purchases')
  };
}

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(purchasesQueryOptions({ limit: 100 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.purchases.title'
      pageDescription='pages.purchases.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <PurchasesListClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
