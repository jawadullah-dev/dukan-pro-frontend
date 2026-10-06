import PageContainer from '@/components/layout/page-container';
import { ExpenseCategoriesClient } from '@/features/dukaan/components/money-stock';
import { expenseCategoriesQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Expense categories' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(expenseCategoriesQueryOptions({ page: 1, limit: 20 }));
  return (
    <PageContainer
      fill
      pageTitle='Expense categories'
      pageDescription='Categories used when recording expenses'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <ExpenseCategoriesClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
