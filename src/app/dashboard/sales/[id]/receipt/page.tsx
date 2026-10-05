import { SaleReceiptClient } from '@/features/dukaan/components/sales';
import { saleQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = { title: 'Sale receipt' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
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
