import { SaleReceiptClient } from '@/features/sales';
import { saleQueryOptions } from '@/features/sales';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('saleReceipt')
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
    <div className='p-6'>
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense>
          <SaleReceiptClient id={id} />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
