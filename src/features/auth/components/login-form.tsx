'use client';

import { useAppForm } from '@/lib/form';
import { FieldGroup } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { z } from 'zod';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Icons } from '@/components/icons';
import { homePathForRole, canAccessPath } from '@/lib/auth/routes';
import { DEMO_OWNER_PHONE, DEMO_SUPER_ADMIN_PHONE } from '@/lib/auth/accounts';
import { isValidPkMobile, normalizePhone } from '@/lib/auth/phone';
import { useT } from '@/i18n/use-t';

export function LoginForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const [error, setError] = useState<string | null>(null);

  const loginSchema = z.object({
    phone: z
      .string()
      .min(1, t('auth.phoneRequired'))
      .refine(isValidPkMobile, t('auth.phoneInvalid')),
    password: z.string().min(1, t('auth.passwordRequired'))
  });

  type LoginValues = z.infer<typeof loginSchema>;

  const form = useAppForm({
    defaultValues: {
      phone: '',
      password: ''
    } as LoginValues,
    validators: {
      onSubmit: loginSchema
    },
    onSubmit: async ({ value }) => {
      setError(null);
      const result = await signIn('credentials', {
        phone: normalizePhone(value.phone),
        password: value.password,
        redirect: false
      });

      if (result?.error) {
        setError(t('auth.invalidCredentials'));
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;
      const home = homePathForRole(role);
      const target =
        callbackUrl && callbackUrl.startsWith('/') && canAccessPath(callbackUrl, role)
          ? callbackUrl
          : home;

      router.replace(target);
      router.refresh();
    }
  });

  return (
    <Card className='w-full max-w-md border-border/60 shadow-sm'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-semibold tracking-tight'>{t('auth.signIn')}</CardTitle>
        <CardDescription>{t('auth.signInHint')}</CardDescription>
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

          <p className='text-muted-foreground text-center text-xs leading-relaxed'>
            Demo: <span className='text-foreground'>{DEMO_SUPER_ADMIN_PHONE}</span> or{' '}
            <span className='text-foreground'>{DEMO_OWNER_PHONE}</span>
            <br />
            Password: <span className='text-foreground'>admin@123</span>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
