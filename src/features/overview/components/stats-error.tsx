'use client';

import { useEffect, useTransition } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useRouter } from '@/i18n/navigation';
import { useT } from '@/i18n/use-t';
import type { StatsErrorAlertProps, StatsErrorFallbackProps } from '@/types';

export function StatsErrorAlert({ message, action }: StatsErrorAlertProps) {
  const t = useT();

  return (
    <Alert variant='destructive'>
      <Icons.alertCircle className='h-4 w-4' />
      <AlertTitle>{t('overview.statsError')}</AlertTitle>
      <AlertDescription className='flex flex-col items-start gap-3'>
        <span>{message}</span>
        {action}
      </AlertDescription>
    </Alert>
  );
}

export function StatsErrorFallback({ error, reset, message }: StatsErrorFallbackProps) {
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
      message={message}
      action={
        <>
          <Button type='button' variant='outline' size='sm' onClick={retry} isLoading={isPending}>
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
