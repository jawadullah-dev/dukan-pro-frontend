import PageContainer from '@/components/layout/page-container';
import { DukaanDashboard } from '@/features/dukaan/components/dashboard';
import { dashboardQueryOptions, sessionQueryOptions } from '@/features/dukaan/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@/auth';
import { PLATFORM_HOME } from '@/lib/auth/routes';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { redirect } from 'next/navigation';
import type { OverViewLayoutProps } from '@/types';
export type { OverViewLayoutProps };

export const metadata = {
  title: 'Dashboard: Overview'
};

function DashboardSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className='h-28 rounded-xl' />
      ))}
    </div>
  );
}

export default async function OverViewLayout({
  sales: _sales,
  pie_stats: _pie,
  bar_stats: _bar,
  area_stats: _area
}: OverViewLayoutProps) {
  const session = await auth();
  if (session?.user?.role === 'SUPER_ADMIN') {
    redirect(PLATFORM_HOME);
  }

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(dashboardQueryOptions());
  void queryClient.prefetchQuery(sessionQueryOptions());

  return (
    <PageContainer pageTitle='pages.dashboard.title' pageDescription='pages.dashboard.description'>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<DashboardSkeleton />}>
          <DukaanDashboard />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
