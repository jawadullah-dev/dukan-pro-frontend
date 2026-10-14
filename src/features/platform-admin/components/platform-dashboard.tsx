'use client';

import { Link } from '@/i18n/navigation';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPkr } from '@/lib/dukaan/numbers';
import { platformOverviewQueryOptions } from '../api/queries';
import { useT } from '@/i18n/use-t';

const KPI_LINKS = [
  { key: 'total_shops', labelKey: 'platform.totalShops', href: '/dashboard/platform/shops' },
  {
    key: 'active_shops',
    labelKey: 'platform.active',
    href: '/dashboard/platform/shops?status=ACTIVE'
  },
  {
    key: 'trial_shops',
    labelKey: 'platform.onTrial',
    href: '/dashboard/platform/shops?status=TRIAL'
  },
  {
    key: 'expired_shops',
    labelKey: 'platform.expired',
    href: '/dashboard/platform/shops?status=EXPIRED'
  },
  {
    key: 'mrr_paisa',
    labelKey: 'platform.monthlyRevenue',
    href: '/dashboard/platform/subscriptions'
  }
] as const;

export function PlatformDashboard() {
  const { data } = useSuspenseQuery(platformOverviewQueryOptions());
  const t = useT();

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>{t('platform.platformOverview')}</h2>
        <p className='text-muted-foreground text-sm'>{t('platform.platformOverviewDescription')}</p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {KPI_LINKS.map((item) => {
          const value = data[item.key];
          const display = item.key === 'mrr_paisa' ? formatPkr(value) : String(value);
          return (
            <Link key={item.key} href={item.href} className='block'>
              <Card className='hover:bg-muted/40 transition-colors'>
                <CardHeader className='pb-2'>
                  <CardDescription>{t(item.labelKey)}</CardDescription>
                  <CardTitle className='text-2xl tabular-nums'>{display}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
