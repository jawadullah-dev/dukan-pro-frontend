import PageContainer from '@/components/layout/page-container';
import { PurchaseDetailClient } from '@/features/dukaan/components/purchases';
import { purchaseQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('purchaseDetail')
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const qc = getQueryClient();
  void qc.prefetchQuery(purchaseQueryOptions(id));
  return (
    <PageContainer
      pageTitle='pages.purchaseDetail.title'
      pageDescription='pages.purchaseDetail.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <PurchaseDetailClient id={id} />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
