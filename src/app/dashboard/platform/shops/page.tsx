import PageContainer from '@/components/layout/page-container';
import { PlatformShopsTable } from '@/features/platform/components/shops-table';
import { platformShopsQueryOptions } from '@/features/platform/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export const metadata = {
  title: 'Shop Management'
};

export default function PlatformShopsPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(platformShopsQueryOptions({ page: 1, limit: 10 }));

  return (
    <PageContainer
      pageTitle='Shop Management'
      pageDescription='Manage all tenant mobile shops and subscriptions'
      pageHeaderAction={
        <Button>
          <Icons.add className='mr-2 h-4 w-4' />
          Create New Shop
        </Button>
      }
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<Skeleton className='h-96 w-full rounded-xl' />}>
          <PlatformShopsTable />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
