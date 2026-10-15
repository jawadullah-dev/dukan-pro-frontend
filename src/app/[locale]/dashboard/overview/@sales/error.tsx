'use client';

import { StatsErrorFallback } from '@/features/overview/components/stats-error';
import { useT } from '@/i18n/use-t';
import type { SalesErrorProps } from '@/types';
export type { SalesErrorProps };

export default function SalesError({ error, reset }: SalesErrorProps) {
  const t = useT();
  return (
    <StatsErrorFallback
      error={error}
      reset={reset}
      message={t('overview.failedToLoadSales', { message: error.message })}
    />
  );
}
