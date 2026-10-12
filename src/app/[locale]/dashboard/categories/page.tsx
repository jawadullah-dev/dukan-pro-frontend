import PageContainer from '@/components/layout/page-container';
import { CategoriesPageClient, categoriesQueryOptions } from '@/features/categories';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('categories')
  };
}

export default async function Page() {
  const session = await auth();
  const qc = getQueryClient();

  if (session?.accessToken) {
    await qc.prefetchQuery(categoriesQueryOptions({ page: 1, pageSize: 20 }, session.accessToken));
  }

  return (
    <PageContainer
      fill
      pageTitle='pages.categories.title'
      pageDescription='pages.categories.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense fallback={<DataTableSkeleton rowCount={3} columnCount={3} />}>
          <CategoriesPageClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
