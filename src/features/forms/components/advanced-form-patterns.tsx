'use client';

import * as React from 'react';
import { useStore } from '@tanstack/react-form';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAppForm } from '@/lib/form';
import { translateMaybe, useT } from '@/i18n/use-t';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AdvancedFormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  team: {
    name: string;
    size: number;
  };
  members: Array<{ name: string; role: string }>;
  country: string;
  state: string;
};

// ---------------------------------------------------------------------------
// Country / State data
// ---------------------------------------------------------------------------

const countryStateMap: Record<string, { value: string; labelKey: string }[]> = {
  us: [
    { value: 'ca', labelKey: 'formOptions.states.california' },
    { value: 'ny', labelKey: 'formOptions.states.newYork' },
    { value: 'tx', labelKey: 'formOptions.states.texas' }
  ],
  uk: [
    { value: 'ldn', labelKey: 'formOptions.states.london' },
    { value: 'mnc', labelKey: 'formOptions.states.manchester' },
    { value: 'brm', labelKey: 'formOptions.states.birmingham' }
  ],
  au: [
    { value: 'nsw', labelKey: 'formOptions.states.newSouthWales' },
    { value: 'vic', labelKey: 'formOptions.states.victoria' },
    { value: 'qld', labelKey: 'formOptions.states.queensland' }
  ]
};

const countryOptionKeys = [
  { value: 'us', labelKey: 'formOptions.countries.us' },
  { value: 'uk', labelKey: 'formOptions.countries.uk' },
  { value: 'au', labelKey: 'formOptions.countries.au' }
];

// ---------------------------------------------------------------------------
// Form-level Zod schema (cross-field validation on submit)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdvancedFormPatterns() {
  const t = useT();
  const countryOptions = countryOptionKeys.map(({ value, labelKey }) => ({
    value,
    label: translateMaybe(labelKey, t)
  }));

  const advancedSchema = z.object({
    username: z.string().min(3, t('advancedFormZod.usernameMin3')),
    email: z.string().email(t('advancedFormZod.emailInvalid')),
    password: z.string().min(8, t('advancedFormZod.passwordMin8')),
    confirmPassword: z.string().min(1, t('advancedFormZod.confirmPasswordRequired')),
    team: z.object({
      name: z.string().min(2, t('advancedFormZod.teamNameMin2')),
      size: z
        .number()
        .min(1, t('advancedFormZod.teamSizeMin1'))
        .max(100, t('advancedFormZod.teamSizeMax100'))
    }),
    members: z
      .array(
        z.object({
          name: z.string().min(1, t('advancedFormZod.memberNameRequired')),
          role: z.string().min(1, t('advancedFormZod.memberRoleRequired'))
        })
      )
      .min(1, t('advancedFormZod.membersRequired')),
    country: z.string().min(1, t('advancedFormZod.countryRequired')),
    state: z.string().min(1, t('advancedFormZod.stateRequired'))
  });

  const form = useAppForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      team: {
        name: '',
        size: 1
      },
      members: [{ name: '', role: '' }],
      country: '',
      state: ''
    } as AdvancedFormValues,
    validators: {
      onSubmit: advancedSchema
    },
    onSubmit: () => {
      toast.success(t('advancedForm.registeredSuccess'));
    }
  });

  // Read current country reactively for dependent state field
  const selectedCountry = useStore(form.store, (s) => s.values.country);
  const stateOptions = (countryStateMap[selectedCountry] ?? []).map(({ value, labelKey }) => ({
    value,
    label: translateMaybe(labelKey, t)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>{t('advancedForm.teamRegistration')}</CardTitle>
        <p className='text-muted-foreground'>{t('advancedForm.formDescription')}</p>
      </CardHeader>
      <CardContent>
        <form
          className='space-y-6'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          {/* ─── Section 1: Account ─── */}
          <div className='space-y-1'>
            <h3 className='text-lg font-semibold'>{t('advancedForm.sectionAccount')}</h3>
            <p className='text-muted-foreground text-sm'>{t('advancedForm.sectionAccountDesc')}</p>
          </div>

          <FieldGroup className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Username — async validation (spinner built into TextField) */}
            <form.AppField
              name='username'
              asyncDebounceMs={500}
              validators={{
                onChangeAsync: async ({ value }) => {
                  if (!value || value.length < 3) return undefined;
                  await new Promise((r) => setTimeout(r, 500));
                  if (value === 'admin' || value === 'test') {
                    return { message: t('advancedFormZod.usernameTaken') };
                  }
                  return undefined;
                }
              }}
              children={(field) => (
                <field.TextField
                  label={t('advancedForm.username')}
                  required
                  placeholder={t('advancedForm.usernamePlaceholder')}
                />
              )}
            />

            <form.AppField
              name='email'
              children={(field) => (
                <field.TextField
                  label={t('advancedForm.email')}
                  required
                  type='email'
                  placeholder={t('advancedForm.emailPlaceholder')}
                />
              )}
            />

            <form.AppField
              name='password'
              children={(field) => (
                <field.TextField
                  label={t('advancedForm.password')}
                  required
                  type='password'
                  placeholder={t('advancedForm.passwordPlaceholder')}
                />
              )}
            />

            {/* Confirm Password — linked validation via onChangeListenTo */}
            <form.AppField
              name='confirmPassword'
              validators={{
                onChangeListenTo: ['password'],
                onChange: ({ value, fieldApi }) => {
                  const password = fieldApi.form.getFieldValue('password');
                  if (value && value !== password) {
                    return { message: t('advancedFormZod.passwordsDoNotMatch') };
                  }
                  return undefined;
                }
              }}
              children={(field) => (
                <field.TextField
                  label={t('advancedForm.confirmPassword')}
                  required
                  type='password'
                  placeholder={t('advancedForm.confirmPasswordPlaceholder')}
                />
              )}
            />
          </FieldGroup>

          <Separator />

          {/* ─── Section 2: Team Info (nested objects) ─── */}
          <div className='space-y-1'>
            <h3 className='text-lg font-semibold'>{t('advancedForm.sectionTeam')}</h3>
            <p className='text-muted-foreground text-sm'>{t('advancedForm.sectionTeamDesc')}</p>
          </div>

          <FieldGroup className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <form.AppField
              name='team.name'
              children={(field) => (
                <field.TextField
                  label={t('advancedForm.teamName')}
                  required
                  placeholder={t('advancedForm.teamNamePlaceholder')}
                />
              )}
            />
            <form.AppField
              name='team.size'
              children={(field) => (
                <field.TextField
                  label={t('advancedForm.teamSize')}
                  required
                  type='number'
                  min={1}
                  max={100}
                  placeholder='1-100'
                />
              )}
            />
          </FieldGroup>

          <Separator />

          {/* ─── Section 3: Members (dynamic array rows — raw form.Field) ─── */}
          <div className='space-y-1'>
            <h3 className='text-lg font-semibold'>{t('advancedForm.sectionMembers')}</h3>
            <p className='text-muted-foreground text-sm'>{t('advancedForm.sectionMembersDesc')}</p>
          </div>

          <form.Field
            name='members'
            mode='array'
            children={(field) => (
              <div className='space-y-3'>
                {field.state.value.map((_, i) => (
                  <div key={i} className='flex items-start gap-2'>
                    <form.Field
                      name={`members[${i}].name`}
                      children={(subField) => {
                        const isSubInvalid =
                          subField.state.meta.isTouched && !subField.state.meta.isValid;
                        return (
                          <Field className='flex-1' data-invalid={isSubInvalid}>
                            <Input
                              id={`member-name-${i}`}
                              name={subField.name}
                              placeholder={t('advancedForm.memberNamePlaceholder')}
                              value={subField.state.value}
                              onChange={(e) => subField.handleChange(e.target.value)}
                              onBlur={subField.handleBlur}
                              aria-label={t('advancedForm.memberNameAria', { n: i + 1 })}
                              aria-invalid={isSubInvalid}
                              aria-describedby={isSubInvalid ? `member-name-${i}-error` : undefined}
                            />
                            {isSubInvalid && (
                              <FieldError
                                id={`member-name-${i}-error`}
                                errors={subField.state.meta.errors}
                              />
                            )}
                          </Field>
                        );
                      }}
                    />
                    <form.Field
                      name={`members[${i}].role`}
                      children={(subField) => {
                        const isSubInvalid =
                          subField.state.meta.isTouched && !subField.state.meta.isValid;
                        return (
                          <Field className='flex-1' data-invalid={isSubInvalid}>
                            <Input
                              id={`member-role-${i}`}
                              name={subField.name}
                              placeholder={t('advancedForm.memberRolePlaceholder')}
                              value={subField.state.value}
                              onChange={(e) => subField.handleChange(e.target.value)}
                              onBlur={subField.handleBlur}
                              aria-label={t('advancedForm.memberRoleAria', { n: i + 1 })}
                              aria-invalid={isSubInvalid}
                              aria-describedby={isSubInvalid ? `member-role-${i}-error` : undefined}
                            />
                            {isSubInvalid && (
                              <FieldError
                                id={`member-role-${i}-error`}
                                errors={subField.state.meta.errors}
                              />
                            )}
                          </Field>
                        );
                      }}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => field.removeValue(i)}
                      aria-label={t('advancedForm.removeMemberAria', { n: i + 1 })}
                    >
                      <Icons.close className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => field.pushValue({ name: '', role: '' })}
                >
                  <Icons.add className='me-2 h-4 w-4' /> {t('advancedForm.addMember')}
                </Button>
                {field.state.value.length > 0 && (
                  <div className='flex flex-wrap gap-1'>
                    {field.state.value
                      .filter((m) => m.name)
                      .map((m, idx) => (
                        <Badge key={idx} variant='secondary'>
                          {m.name}
                          {m.role ? ` (${m.role})` : ''}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            )}
          />

          <Separator />

          {/* ─── Section 4: Preferences (listeners / side effects) ─── */}
          <div className='space-y-1'>
            <h3 className='text-lg font-semibold'>{t('advancedForm.sectionPreferences')}</h3>
            <p className='text-muted-foreground text-sm'>
              {t('advancedForm.sectionPreferencesDesc')}
            </p>
          </div>

          <FieldGroup className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <form.AppField
              name='country'
              listeners={{
                onChange: ({ fieldApi }) => {
                  fieldApi.form.setFieldValue('state', '');
                }
              }}
              children={(field) => (
                <field.SelectField
                  label={t('advancedForm.country')}
                  required
                  options={countryOptions}
                  placeholder={t('advancedForm.countryPlaceholder')}
                />
              )}
            />
            <form.AppField
              name='state'
              children={(field) => (
                <field.SelectField
                  label={t('advancedForm.stateRegion')}
                  required
                  options={stateOptions}
                  placeholder={
                    selectedCountry
                      ? t('advancedForm.statePlaceholder')
                      : t('advancedForm.stateFirstCountry')
                  }
                />
              )}
            />
          </FieldGroup>

          <Separator />

          {/* ─── Submit ─── */}
          <div className='flex gap-4 pt-2'>
            <Button type='button' variant='outline' onClick={() => form.reset()} className='flex-1'>
              {t('advancedForm.reset')}
            </Button>
            <form.AppForm>
              <form.SubmitButton className='flex-1'>
                {t('advancedForm.registerTeam')}
              </form.SubmitButton>
            </form.AppForm>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
