import PageContainer from '@/components/layout/page-container';
import { PurchasesListClient } from '@/features/purchases';
import { purchasesQueryOptions } from '@/features/purchases';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('purchases')
  };
}

export default async function Page() {
  const session = await auth();
  const token = session?.accessToken;
  const qc = getQueryClient();
  if (token) {
    await qc.prefetchQuery(
      purchasesQueryOptions(
        { page: 1, pageSize: 20, sortBy: 'purchaseDate', sortOrder: 'desc' },
        token
      )
    );
  }

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
