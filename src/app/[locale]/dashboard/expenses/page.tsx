import PageContainer from '@/components/layout/page-container';
import { ExpensesClient } from '@/features/dukaan/components/money-stock';
import { expenseCategoriesQueryOptions, expensesQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('expenses')
  };
}

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(expensesQueryOptions({ limit: 100 }));
  void qc.prefetchQuery(expenseCategoriesQueryOptions({ limit: 100 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.expenses.title'
      pageDescription='pages.expenses.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <ExpensesClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
