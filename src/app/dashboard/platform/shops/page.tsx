import PageContainer from '@/components/layout/page-container';
import {
  CreateShopHeaderAction,
  PlatformShopsListClient
} from '@/features/platform/components/shops-page-client';
import { platformShopsQueryOptions } from '@/features/platform/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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
      pageHeaderAction={<CreateShopHeaderAction />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<Skeleton className='h-96 w-full rounded-xl' />}>
          <PlatformShopsListClient />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
