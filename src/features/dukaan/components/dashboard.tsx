'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPkr } from '@/lib/dukaan/numbers';
import { dashboardQueryOptions, sessionQueryOptions } from '../api/queries';

const KPI_LINKS = [
  { key: 'today_sales', label: "Today's Sales", href: '/dashboard/sales' },
  { key: 'today_net_profit', label: "Today's Net Profit", href: '/dashboard/overview' },
  { key: 'customer_udhar', label: 'Customer Udhar', href: '/dashboard/customers' },
  { key: 'supplier_payable', label: 'Supplier Payable', href: '/dashboard/suppliers' },
  { key: 'today_expenses', label: "Today's Expenses", href: '/dashboard/expenses' },
  { key: 'low_stock_count', label: 'Low-stock Products', href: '/dashboard/inventory' },
  { key: 'cash_position', label: 'Cash Position', href: '/dashboard/cash' }
] as const;

export function DukaanDashboard() {
  const { data: kpis } = useSuspenseQuery(dashboardQueryOptions());
  const { data: session } = useSuspenseQuery(sessionQueryOptions());

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Hi, {session.user_name.split(' ')[0]}</h2>
        <p className='text-muted-foreground text-sm'>
          {session.shop_name} — today&apos;s shop snapshot (Release 1)
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {KPI_LINKS.map((item) => {
          const value = kpis[item.key];
          const display = item.key === 'low_stock_count' ? String(value) : formatPkr(value);
          return (
            <Link
              key={item.key}
              href={item.href}
              className='block'
              aria-label={`${item.label}: ${display}`}
            >
              <Card className='hover:bg-muted/40 cursor-pointer transition-colors'>
                <CardHeader>
                  <CardDescription>{item.label}</CardDescription>
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
