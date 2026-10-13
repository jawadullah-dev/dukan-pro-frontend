import PageContainer from '@/components/layout/page-container';
import { SuppliersPageClient, suppliersQueryOptions } from '@/features/suppliers';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('suppliers')
  };
}

export default async function Page() {
  const session = await auth();
  const qc = getQueryClient();

  if (session?.accessToken) {
    await qc.prefetchQuery(
      suppliersQueryOptions(
        { page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' },
        session.accessToken
      )
    );
  }

  return (
    <PageContainer
      fill
      pageTitle='pages.suppliers.title'
      pageDescription='pages.suppliers.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <SuppliersPageClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
