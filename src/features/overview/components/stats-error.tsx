'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { useT } from '@/i18n/use-t';

interface StatsErrorAlertProps {
  message: string;
  action: React.ReactNode;
}

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
