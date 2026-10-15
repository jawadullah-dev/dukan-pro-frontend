'use client';

import { StatsErrorFallback } from '@/features/overview/components/stats-error';
import { useT } from '@/i18n/use-t';
import type { OverviewErrorProps } from '@/types';
export type { OverviewErrorProps };

export default function OverviewError({ error, reset }: OverviewErrorProps) {
  const t = useT();
  return (
    <StatsErrorFallback
      error={error}
      reset={reset}
      message={t('overview.failedToLoadStats', { message: error.message })}
    />
  );
}
