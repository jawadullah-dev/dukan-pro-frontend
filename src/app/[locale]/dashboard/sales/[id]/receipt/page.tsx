import { SaleReceiptClient } from '@/features/sales';
import { saleQueryOptions } from '@/features/sales';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import type { IdPageProps } from '@/types';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('saleReceipt')
  };
}

export default async function Page({ params }: IdPageProps) {
  const { id } = await params;
  const session = await auth();
  const token = session?.accessToken;
  const qc = getQueryClient();
  void qc.prefetchQuery(saleQueryOptions(id, token));

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
