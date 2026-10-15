'use client';

import { signIn, getSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { PLATFORM_HOME } from '@/lib/auth/routes';
import { normalizePhone } from '@/lib/auth/phone';
import type { LoginValues } from '@/types/auth';
import { BaseLoginForm } from './base-login-form';

export function PlatformAdminLoginForm() {
  const t = useTranslations();
  const router = useRouter();

  const handleLogin = async (values: LoginValues): Promise<string | null> => {
    const result = await signIn('credentials', {
      phone: normalizePhone(values.phone),
      password: values.password,
      isPlatformAdmin: 'true',
      redirect: false
    });

    if (result?.error) {
      return t('auth.platformAdminError');
    }

    await getSession();
    router.replace(PLATFORM_HOME);
    router.refresh();
    return null;
  };

  return (
    <BaseLoginForm
      title={t('auth.platformAdminSignInTitle')}
      description={t('auth.platformAdminSignInDesc')}
      minPasswordLength={8}
      onSubmit={handleLogin}
      footer={
        <p className='text-muted-foreground text-center text-xs'>{t('auth.platformAdminNotice')}</p>
      }
    />
  );
}
