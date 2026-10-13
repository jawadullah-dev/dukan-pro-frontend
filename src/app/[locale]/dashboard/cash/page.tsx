import PageContainer from '@/components/layout/page-container';
import { CashLedgerClient, cashQueryOptions } from '@/features/cash';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@/auth';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('cashLedger')
  };
}

export default async function Page() {
  const session = await auth();
  const token = session?.accessToken;
  const qc = getQueryClient();
  if (token) {
    await qc.prefetchQuery(
      cashQueryOptions({ page: 1, pageSize: 20, sortBy: 'movementDate', sortOrder: 'desc' }, token)
    );
  }
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
