'use client';

import { StatsErrorFallback } from '@/features/overview/components/stats-error';
import { useT } from '@/i18n/use-t';
import type { PieStatsErrorProps } from '@/types';
export type { PieStatsErrorProps };

export default function PieStatsError({ error, reset }: PieStatsErrorProps) {
  const t = useT();
  return (
    <StatsErrorFallback
      error={error}
      reset={reset}
      message={t('overview.failedToLoadPie', { message: error.message })}
    />
  );
}
