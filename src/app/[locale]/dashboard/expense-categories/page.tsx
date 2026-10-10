import PageContainer from '@/components/layout/page-container';
import { ExpenseCategoriesClient } from '@/features/expenses';
import { expenseCategoriesQueryOptions } from '@/features/expenses';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('expenseCategories')
  };
}

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(expenseCategoriesQueryOptions({ page: 1, limit: 20 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.expenseCategories.title'
      pageDescription='pages.expenseCategories.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <ExpenseCategoriesClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
