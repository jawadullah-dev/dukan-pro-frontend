import PageContainer from '@/components/layout/page-container';
import { PurchaseDetailClient } from '@/features/purchases';
import { purchaseQueryOptions } from '@/features/purchases';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import type { IdPageProps } from '@/types';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('purchaseDetail')
  };
}

export default async function Page({ params }: IdPageProps) {
  const { id } = await params;
  const session = await auth();
  const token = session?.accessToken;
  const qc = getQueryClient();
  if (token) {
    await qc.prefetchQuery(purchaseQueryOptions(id, token));
  }

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
