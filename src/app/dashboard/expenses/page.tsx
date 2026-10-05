import PageContainer from '@/components/layout/page-container';
import { ExpensesClient } from '@/features/dukaan/components/money-stock';
import { expenseCategoriesQueryOptions, expensesQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Expenses' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(expensesQueryOptions({ limit: 100 }));
  void qc.prefetchQuery(expenseCategoriesQueryOptions({ limit: 100 }));
  return (
    <PageContainer pageTitle='Expenses' pageDescription='Operating expenses'>
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <ExpensesClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
