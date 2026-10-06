import PageContainer from '@/components/layout/page-container';
import { SaleDetailClient } from '@/features/dukaan/components/sales';
import { saleQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Sale' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
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
