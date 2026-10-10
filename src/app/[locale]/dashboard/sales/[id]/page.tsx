import PageContainer from '@/components/layout/page-container';
import { SaleDetailClient } from '@/features/sales';
import { saleQueryOptions } from '@/features/sales';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('saleDetail')
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const qc = getQueryClient();
  void qc.prefetchQuery(saleQueryOptions(id));
  return (
    <PageContainer
      pageTitle='pages.saleDetail.title'
      pageDescription='pages.saleDetail.description'
    >
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <SaleDetailClient id={id} />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
