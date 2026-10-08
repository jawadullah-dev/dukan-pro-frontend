import PageContainer from '@/components/layout/page-container';
import { ProductsListClient } from '@/features/dukaan/components/products';
import {
  brandsQueryOptions,
  categoriesQueryOptions,
  productsQueryOptions
} from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('productNew')
  };
}

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(productsQueryOptions({ page: 1, limit: 20 }));
  void qc.prefetchQuery(categoriesQueryOptions({ limit: 100 }));
  void qc.prefetchQuery(brandsQueryOptions({ limit: 100 }));
  return (
    <PageContainer pageTitle='common.createProduct' pageDescription='pages.products.description'>
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <ProductsListClient defaultOpenAdd />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
