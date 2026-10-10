import PageContainer from '@/components/layout/page-container';
import { CashLedgerClient } from '@/features/cash';
import { cashQueryOptions } from '@/features/cash';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('cashLedger')
  };
}

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
