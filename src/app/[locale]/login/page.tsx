import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/login-form';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return {
    title: t('signIn'),
    description: t('signInHint')
  };
}

export default async function LoginPage() {
  const t = await getTranslations('auth');
  const tm = await getTranslations('metadata');
  return (
    <div className='bg-background relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-6'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.7_0.05_250_/_0.12),transparent_55%)]'
      />
      <div className='relative z-10 mb-8 text-center'>
        <p className='text-muted-foreground text-sm font-medium tracking-wide uppercase'>
          {tm('dukaanPro')}
        </p>
        <h1 className='mt-1 text-3xl font-semibold tracking-tight'>{t('welcomeBack')}</h1>
      </div>
      <div className='relative z-10 w-full max-w-md'>
        <Suspense fallback={<div className='bg-muted h-80 animate-pulse rounded-xl' />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
