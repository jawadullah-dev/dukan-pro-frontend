'use client';

import { useState } from 'react';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAppForm } from '@/lib/form';
import { FieldGroup } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { isValidPkMobile, normalizePhone } from '@/lib/auth/phone';
import { SHOP_HOME } from '@/lib/auth/routes';
import { registerOwnerAccount } from '@/features/auth/api/service';
import type { RegisterFormValues, RegisterFormProps } from '@/types/auth';

export function RegisterForm({ title, description, footer }: RegisterFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const registerSchema = z
    .object({
      fullName: z.string().min(2, t('auth.fullNameRequired')),
      phone: z
        .string()
        .min(1, t('auth.phoneRequired'))
        .refine(isValidPkMobile, t('auth.phoneInvalid')),
      password: z.string().min(6, t('auth.passwordRequired')),
      confirmPassword: z.string().min(1, t('auth.confirmPasswordRequired')),
      shopName: z.string().min(2, t('auth.shopNameRequired')),
      city: z.string().min(2, t('auth.cityRequired')),
      address: z.string().optional()
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.passwordMismatch'),
      path: ['confirmPassword']
    });

  const form = useAppForm({
    defaultValues: {
      fullName: '',
      phone: '',
      password: '',
      confirmPassword: '',
      shopName: '',
      city: '',
      address: ''
    } as RegisterFormValues,
    validators: {
      onSubmit: registerSchema
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setSuccess(null);

      const normalizedPhone = normalizePhone(value.phone);

      try {
        await registerOwnerAccount({
          fullName: value.fullName.trim(),
          phone: normalizedPhone,
          password: value.password,
          shopName: value.shopName.trim(),
          city: value.city.trim(),
          address: value.address?.trim() || undefined
        });

        setSuccess(t('auth.registerSuccess'));

        const signInResult = await signIn('credentials', {
          phone: normalizedPhone,
          password: value.password,
          redirect: false
        });

        if (signInResult?.error) {
          router.push('/login');
          return;
        }

        router.replace(SHOP_HOME);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : t('auth.registerFailed');
        setError(message);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <Card className='w-full max-w-lg border-border/60 shadow-sm'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-semibold tracking-tight'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className='space-y-5' onSubmit={handleSubmit}>
          {error ? (
            <Alert variant='destructive'>
              <Icons.warning className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {success ? (
            <Alert>
              <Icons.check className='h-4 w-4 text-emerald-600' />
              <AlertDescription className='text-emerald-600 dark:text-emerald-400'>
                {success}
              </AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <form.AppField
                name='fullName'
                children={(field) => (
                  <field.TextField
                    label={t('auth.fullName')}
                    autoComplete='name'
                    placeholder={t('auth.fullNamePlaceholder')}
                    startIcon={Icons.user}
                    required
                  />
                )}
              />
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
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <form.AppField
                name='password'
                children={(field) => (
                  <field.TextField
                    label={t('auth.password')}
                    type='password'
                    autoComplete='new-password'
                    placeholder='••••••••'
                    startIcon={Icons.lock}
                    required
                  />
                )}
              />
              <form.AppField
                name='confirmPassword'
                children={(field) => (
                  <field.TextField
                    label={t('auth.confirmPassword')}
                    type='password'
                    autoComplete='new-password'
                    placeholder='••••••••'
                    startIcon={Icons.lock}
                    required
                  />
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <form.AppField
                name='shopName'
                children={(field) => (
                  <field.TextField
                    label={t('auth.shopName')}
                    placeholder={t('auth.shopNamePlaceholder')}
                    startIcon={Icons.building}
                    required
                  />
                )}
              />
              <form.AppField
                name='city'
                children={(field) => (
                  <field.TextField
                    label={t('auth.city')}
                    placeholder={t('auth.cityPlaceholder')}
                    startIcon={Icons.building}
                    required
                  />
                )}
              />
            </div>

            <form.AppField
              name='address'
              children={(field) => (
                <field.TextField
                  label={t('auth.address')}
                  placeholder={t('auth.addressPlaceholder')}
                  startIcon={Icons.building}
                />
              )}
            />
          </FieldGroup>

          <form.AppForm>
            <form.SubmitButton className='w-full'>{t('auth.registerButton')}</form.SubmitButton>
          </form.AppForm>

          {footer}
        </form>
      </CardContent>
    </Card>
  );
}
