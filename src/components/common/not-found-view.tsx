'use client';

import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';
import type { NotFoundViewProps } from '@/types/common';

export function NotFoundView({ onBack, onHome }: NotFoundViewProps) {
  const t = useT();

  return (
    <div className='absolute top-1/2 start-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center'>
      <span className='from-foreground bg-linear-to-b to-transparent bg-clip-text text-[10rem] leading-none font-extrabold text-transparent'>
        404
      </span>
      <h2 className='font-heading my-2 text-2xl font-bold'>{t('errors.notFoundTitle')}</h2>
      <p>{t('errors.notFoundDescription')}</p>
      <div className='mt-8 flex justify-center gap-2'>
        <Button type='button' onClick={onBack} variant='default' size='lg'>
          {t('errors.goBack')}
        </Button>
        <Button type='button' onClick={onHome} variant='ghost' size='lg'>
          {t('errors.backHome')}
        </Button>
      </div>
    </div>
  );
}
