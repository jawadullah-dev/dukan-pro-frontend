import PageContainer from '@/components/layout/page-container';
import { ProductsListClient } from '@/features/dukaan/components/products';
import { productsQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('products')
  };
}

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(productsQueryOptions({ page: 1, limit: 20 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.products.title'
      pageDescription='pages.products.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <ProductsListClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
