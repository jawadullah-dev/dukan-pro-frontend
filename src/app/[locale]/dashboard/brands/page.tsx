import PageContainer from '@/components/layout/page-container';
import { BrandsPageClient, brandsQueryOptions } from '@/features/brands';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('brands')
  };
}

export default async function Page() {
  const session = await auth();
  const qc = getQueryClient();

  if (session?.accessToken) {
    await qc.prefetchQuery(brandsQueryOptions({ page: 1, pageSize: 20 }, session.accessToken));
  }

  return (
    <PageContainer fill pageTitle='pages.brands.title' pageDescription='pages.brands.description'>
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <BrandsPageClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
