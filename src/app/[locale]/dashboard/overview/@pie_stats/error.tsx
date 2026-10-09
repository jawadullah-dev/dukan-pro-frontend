'use client';

import { Button } from '@/components/ui/button';
import { StatsErrorAlert } from '@/features/overview/components/stats-error';
import { useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useT } from '@/i18n/use-t';

interface PieStatsErrorProps {
  error: Error;
  reset: () => void;
}

export default function PieStatsError({ error, reset }: PieStatsErrorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useT();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const retry = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <StatsErrorAlert
      message={t('overview.failedToLoadPie', { message: error.message })}
      action={
        <>
          <Button variant='outline' size='sm' onClick={retry} isLoading={isPending}>
            {t('overview.tryAgain')}
          </Button>
          <span role='status' aria-live='polite' className='sr-only'>
            {isPending ? t('overview.retrying') : ''}
          </span>
        </>
      }
    />
  );
}
