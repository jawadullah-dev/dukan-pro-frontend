import PageContainer from '@/components/layout/page-container';
import { ProductsPageClient, productsQueryOptions } from '@/features/products';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('products')
  };
}

export default async function Page() {
  const session = await auth();
  const qc = getQueryClient();

  if (session?.accessToken) {
    await qc.prefetchQuery(productsQueryOptions({ page: 1, pageSize: 20 }, session.accessToken));
  }

  return (
    <PageContainer
      fill
      pageTitle='pages.products.title'
      pageDescription='pages.products.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense fallback={<DataTableSkeleton rowCount={3} columnCount={5} />}>
          <ProductsPageClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
