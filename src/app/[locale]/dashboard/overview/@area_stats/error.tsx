'use client';

import { StatsErrorFallback } from '@/features/overview/components/stats-error';
import { useT } from '@/i18n/use-t';
import type { AreaStatsErrorProps } from '@/types';
export type { AreaStatsErrorProps };

export default function AreaStatsError({ error, reset }: AreaStatsErrorProps) {
  const t = useT();
  return (
    <StatsErrorFallback
      error={error}
      reset={reset}
      message={t('overview.failedToLoadArea', { message: error.message })}
    />
  );
}
