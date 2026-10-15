'use client';

import { signIn, getSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { SHOP_HOME, PLATFORM_HOME, canAccessPath, delocalize } from '@/lib/auth/routes';
import { normalizePhone } from '@/lib/auth/phone';
import type { LoginValues } from '@/types/auth';
import { BaseLoginForm } from './base-login-form';

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  const handleLogin = async (values: LoginValues): Promise<string | null> => {
    const result = await signIn('credentials', {
      phone: normalizePhone(values.phone),
      password: values.password,
      redirect: false
    });

    if (result?.error) {
      return t('auth.invalidCredentials');
    }

    const session = await getSession();
    const role = session?.user?.role;
    const home = role === 'SUPER_ADMIN' ? PLATFORM_HOME : SHOP_HOME;
    const target =
      callbackUrl && callbackUrl.startsWith('/') && canAccessPath(callbackUrl, role)
        ? delocalize(callbackUrl)
        : home;

    router.replace(target);
    router.refresh();
    return null;
  };

  return (
    <BaseLoginForm
      title={t('auth.signIn')}
      description={t('auth.signInHint')}
      minPasswordLength={1}
      onSubmit={handleLogin}
      footer={
        <div className='space-y-2 text-center text-xs leading-relaxed'>
          <p className='text-muted-foreground'>
            {t('auth.dontHaveAccountPrompt')}{' '}
            <Link
              href='/register'
              className='text-primary font-medium underline-offset-4 hover:underline'
            >
              {t('auth.registerLink')}
            </Link>
          </p>
          <p className='text-muted-foreground'>
            {t('auth.platformAdminPrompt')}{' '}
            <Link
              href='/platform-admin/login'
              className='text-foreground underline-offset-4 hover:underline'
            >
              {t('auth.platformAdminSignInLink')}
            </Link>
          </p>
        </div>
      }
    />
  );
}
