'use client';

import { useAppForm } from '@/lib/form';
import { FieldGroup } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icons } from '@/components/icons';
import { useTranslations, useLocale } from 'next-intl';
import { homePathForRole } from '@/lib/auth/routes';
import { isValidPkMobile, normalizePhone } from '@/lib/auth/phone';
import { getSession } from 'next-auth/react';

const platformAdminLoginSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(isValidPkMobile, 'Enter a valid Pakistani mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

type PlatformAdminLoginValues = z.infer<typeof platformAdminLoginSchema>;

export function PlatformAdminLoginForm() {
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

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
        setError('Phone number or password is incorrect. Please try again.');
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;
      router.replace(homePathForRole(role, locale));
      router.refresh();
    }
  });

  return (
    <Card className='w-full max-w-md border-border/60 shadow-sm'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-semibold tracking-tight'>
          Platform Admin Sign In
        </CardTitle>
        <CardDescription>Sign in to manage shops and subscriptions</CardDescription>
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
                  label='Phone'
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
                  label='Password'
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
              Sign In
            </form.SubmitButton>
          </form.AppForm>

          <p className='text-muted-foreground text-center text-xs'>
            This portal is for Dukaan Pro platform administrators only.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
