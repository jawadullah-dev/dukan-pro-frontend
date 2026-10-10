import PageContainer from '@/components/layout/page-container';
import { SuppliersListClient } from '@/features/suppliers';
import { suppliersQueryOptions } from '@/features/suppliers';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('suppliers')
  };
}

export default function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(suppliersQueryOptions({ limit: 100 }));
  return (
    <PageContainer
      fill
      pageTitle='pages.suppliers.title'
      pageDescription='pages.suppliers.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <SuppliersListClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
