import PageContainer from '@/components/layout/page-container';
import { PlatformDashboard } from '@/features/platform/components/platform-dashboard';
import { platformOverviewQueryOptions } from '@/features/platform/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Platform Dashboard'
};

function PlatformDashboardSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className='h-28 rounded-xl' />
      ))}
    </div>
  );
}

export default function PlatformPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(platformOverviewQueryOptions());

  return (
    <PageContainer
      pageTitle='Platform'
      pageDescription='Manage dukan shops and subscriptions across the platform.'
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<PlatformDashboardSkeleton />}>
          <PlatformDashboard />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
