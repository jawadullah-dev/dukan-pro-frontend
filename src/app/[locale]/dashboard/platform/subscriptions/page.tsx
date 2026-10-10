import PageContainer from '@/components/layout/page-container';
import { TablePageBody } from '@/components/layout/table-page-body';
import { PlatformSubscriptionsTable } from '@/features/platform-admin/components/subscriptions-table';
import { platformSubscriptionsQueryOptions } from '@/features/platform-admin/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return {
    title: t('subscriptions')
  };
}

export default async function PlatformSubscriptionsPage() {
  const queryClient = getQueryClient();
  const t = await getTranslations('platform');
  void queryClient.prefetchQuery(platformSubscriptionsQueryOptions({ page: 1, limit: 10 }));

  return (
    <PageContainer
      fill
      pageTitle='pages.subscriptions.title'
      pageDescription='platform.assignManagePlans'
      pageHeaderAction={
        <Button>
          <Icons.add className='ms-2 h-4 w-4' />
          {t('assignPlanButton')}
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
