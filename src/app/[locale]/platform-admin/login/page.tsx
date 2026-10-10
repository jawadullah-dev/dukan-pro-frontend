import { Suspense } from 'react';
import { PlatformAdminLoginForm } from '@/features/auth/components/platform-admin-login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Admin Sign In — Dukaan Pro',
  description: 'Sign in to the Dukaan Pro platform admin panel to manage shops and subscriptions.'
};

export default function PlatformAdminLoginPage() {
  return (
    <div className='bg-background relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-6'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.6_0.1_20_/_0.1),transparent_55%)]'
      />
      <div className='relative z-10 mb-8 text-center'>
        <p className='text-muted-foreground text-sm font-medium tracking-wide uppercase'>
          Dukaan Pro
        </p>
        <h1 className='mt-1 text-3xl font-semibold tracking-tight'>Platform Admin</h1>
      </div>
      <div className='relative z-10 w-full max-w-md'>
        <Suspense fallback={<div className='bg-muted h-80 animate-pulse rounded-xl' />}>
          <PlatformAdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
