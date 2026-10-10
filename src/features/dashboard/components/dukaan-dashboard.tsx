'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPkr } from '@/lib/money';
import { dashboardQueryOptions, sessionQueryOptions } from '../api/queries';
import { KPI_LINKS } from '../constants/dashboard-constants';
import { useT } from '@/i18n/use-t';

export function DukaanDashboard() {
  const t = useT();
  const { data: kpis } = useSuspenseQuery(dashboardQueryOptions());
  const { data: session } = useSuspenseQuery(sessionQueryOptions());
  const firstName = session.user_name.split(' ')[0] || session.user_name;

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>
          {t('dashboard.hi', { name: firstName })}
        </h2>
        <p className='text-muted-foreground text-sm'>
          {t('dashboard.snapshot', { shop: session.shop_name })}
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {KPI_LINKS.map((item) => {
          const value = kpis[item.key];
          const label = t(item.labelKey);
          const display = item.key === 'low_stock_count' ? String(value) : formatPkr(value);
          return (
            <Link
              key={item.key}
              href={item.href}
              className='block'
              aria-label={`${label}: ${display}`}
            >
              <Card className='hover:bg-muted/40 cursor-pointer transition-colors'>
                <CardHeader>
                  <CardDescription>{label}</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums'>{display}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
