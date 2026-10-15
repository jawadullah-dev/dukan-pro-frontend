'use client';

import { StatsErrorFallback } from '@/features/overview/components/stats-error';
import { useT } from '@/i18n/use-t';
import type { BarStatsErrorProps } from '@/types';
export type { BarStatsErrorProps };

export default function BarStatsError({ error, reset }: BarStatsErrorProps) {
  const t = useT();
  return (
    <StatsErrorFallback
      error={error}
      reset={reset}
      message={t('overview.failedToLoadBar', { message: error.message })}
    />
  );
}
