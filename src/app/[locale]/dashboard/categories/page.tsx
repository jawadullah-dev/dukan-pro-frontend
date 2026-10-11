import PageContainer from '@/components/layout/page-container';
import { CategoriesPageClient } from '@/features/categories';
import { categoriesQueryOptions } from '@/features/categories';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('categories')
  };
}

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(categoriesQueryOptions({ page: 1, limit: 20 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.categories.title'
      pageDescription='pages.categories.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense fallback={<DataTableSkeleton rowCount={8} columnCount={3} />}>
          <CategoriesPageClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
