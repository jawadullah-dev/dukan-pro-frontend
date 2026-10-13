import PageContainer from '@/components/layout/page-container';
import { PurchasesListClient, purchasesQueryOptions } from '@/features/purchases';
import { suppliersQueryOptions } from '@/features/suppliers';
import { productsQueryOptions } from '@/features/products';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('purchaseNew')
  };
}

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(purchasesQueryOptions({ limit: 100 }));
  void qc.prefetchQuery(suppliersQueryOptions({ limit: 100 }));
  void qc.prefetchQuery(productsQueryOptions({ page: 1, pageSize: 100 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.purchases.title'
      pageDescription='pages.purchases.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <PurchasesListClient defaultOpenAdd />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
