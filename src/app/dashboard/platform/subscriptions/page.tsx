import PageContainer from '@/components/layout/page-container';
import { TablePageBody } from '@/components/layout/table-page-body';
import { PlatformSubscriptionsTable } from '@/features/platform/components/subscriptions-table';
import { platformSubscriptionsQueryOptions } from '@/features/platform/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export const metadata = {
  title: 'Subscriptions'
};

export default function PlatformSubscriptionsPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(platformSubscriptionsQueryOptions({ page: 1, limit: 10 }));

  return (
    <PageContainer
      fill
      pageTitle='pages.subscriptions.title'
      pageDescription='Assign and manage shop subscription plans.'
      pageHeaderAction={
        <Button>
          <Icons.add className='mr-2 h-4 w-4' />
          Assign Plan
        </Button>
      }
    >
      <TablePageBody>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<Skeleton className='h-96 w-full rounded-xl' />}>
            <PlatformSubscriptionsTable />
          </Suspense>
        </HydrationBoundary>
      </TablePageBody>
    </PageContainer>
  );
}
