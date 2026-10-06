import PageContainer from '@/components/layout/page-container';
import { CashLedgerClient } from '@/features/dukaan/components/money-stock';
import { cashQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Cash ledger' };

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(cashQueryOptions({ limit: 100 }));
  return (
    <PageContainer fill pageTitle='pages.cash.title' pageDescription='pages.cash.description'>
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <CashLedgerClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
