'use client';

import { useAppForm } from '@/lib/form';
import { FieldGroup } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { z } from 'zod';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { Icons } from '@/components/icons';
import { useTranslations } from 'next-intl';
import { PLATFORM_HOME } from '@/lib/auth/routes';
import { isValidPkMobile, normalizePhone } from '@/lib/auth/phone';
import type { PlatformAdminLoginValues } from '@/types/auth';

export function PlatformAdminLoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const platformAdminLoginSchema = z.object({
    phone: z
      .string()
      .min(1, t('auth.phoneRequired'))
      .refine(isValidPkMobile, t('auth.phoneInvalid')),
    password: z.string().min(8, t('auth.passwordRequired'))
  });

  const form = useAppForm({
    defaultValues: {
      phone: '',
      password: ''
    } as PlatformAdminLoginValues,
    validators: {
      onSubmit: platformAdminLoginSchema
    },
    onSubmit: async ({ value }) => {
      setError(null);

      const result = await signIn('credentials', {
        phone: normalizePhone(value.phone),
        password: value.password,
        isPlatformAdmin: 'true',
        redirect: false
      });

      if (result?.error) {
        setError(t('auth.platformAdminError'));
        return;
      }

      await getSession();
      router.replace(PLATFORM_HOME);
      router.refresh();
    }
  });

  return (
    <Card className='w-full max-w-md border-border/60 shadow-sm'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-semibold tracking-tight'>
          {t('auth.platformAdminSignInTitle')}
        </CardTitle>
        <CardDescription>{t('auth.platformAdminSignInDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className='space-y-6'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          {error ? (
            <Alert variant='destructive'>
              <Icons.warning className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup>
            <form.AppField
              name='phone'
              children={(field) => (
                <field.TextField
                  label={t('auth.phone')}
                  type='tel'
                  inputMode='numeric'
                  autoComplete='tel'
                  placeholder='03XXXXXXXXX'
                  startIcon={Icons.phone}
                  required
                />
              )}
            />
            <form.AppField
              name='password'
              children={(field) => (
                <field.TextField
                  label={t('auth.password')}
                  type='password'
                  autoComplete='current-password'
                  placeholder='••••••••'
                  startIcon={Icons.lock}
                  required
                />
              )}
            />
          </FieldGroup>

          <form.AppForm>
            <form.SubmitButton className='w-full'>
              <Icons.login className='size-4' />
              {t('auth.signIn')}
            </form.SubmitButton>
          </form.AppForm>

          <p className='text-muted-foreground text-center text-xs'>
            {t('auth.platformAdminNotice')}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
