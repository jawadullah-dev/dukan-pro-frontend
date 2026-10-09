'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className='absolute top-1/2 start-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center'>
      <span className='from-foreground bg-linear-to-b to-transparent bg-clip-text text-[10rem] leading-none font-extrabold text-transparent'>
        404
      </span>
      <h2 className='font-heading my-2 text-2xl font-bold'>{t('errors.notFoundTitle')}</h2>
      <p>{t('errors.notFoundDescription')}</p>
      <div className='mt-8 flex justify-center gap-2'>
        <Button onClick={() => router.back()} variant='default' size='lg'>
          {t('errors.goBack')}
        </Button>
        <Button onClick={() => router.push('/en/dashboard')} variant='ghost' size='lg'>
          {t('errors.backHome')}
        </Button>
      </div>
    </div>
  );
}
