'use client';

import * as React from 'react';
import { useStore } from '@tanstack/react-form';
import * as z from 'zod';
import { useAppForm } from '@/lib/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ToggleGroupItem } from '@/components/ui/toggle-group';
import type { DateRange } from 'react-day-picker';
import { Icons } from '@/components/icons';
import { translateMaybe, useT } from '@/i18n/use-t';
import { toast } from 'sonner';

const demoFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t('demoFormZod.nameMin2')),
    email: z.email(t('demoFormZod.emailInvalid')),
    age: z.number({ error: t('demoFormZod.ageRequired') }).min(18, t('demoFormZod.ageMin18')),
    password: z.string().min(8, t('demoFormZod.passwordMin8')),
    phone: z.string().min(10, t('demoFormZod.phoneMin10')),
    website: z.string().url(t('demoFormZod.urlInvalid')).or(z.literal('')),
    bio: z.string().min(10, t('demoFormZod.bioMin10')),
    country: z.string().min(1, t('demoFormZod.countryRequired')),
    framework: z.string().min(1, t('demoFormZod.frameworkRequired')),
    interests: z.array(z.string()).min(1, t('demoFormZod.interestsRequired')),
    gender: z.string().min(1, t('demoFormZod.genderRequired')),
    newsletter: z.boolean(),
    rating: z.number().min(0).max(10),
    birthDate: z.date().optional(),
    dateRange: z.any().optional(),
    eventTime: z.string().optional(),
    favoriteColor: z.string().optional(),
    otp: z.string().min(6, t('demoFormZod.otpMin6')),
    formatting: z.array(z.string()).optional(),
    tags: z.array(z.string()).min(1, t('demoFormZod.tagsRequired')),
    terms: z.boolean().refine((val) => val === true, t('demoFormZod.termsRequired')),
    avatar: z.array(z.any()).optional()
  });

const countryOptionKeys = [
  { value: 'us', labelKey: 'formOptions.countries.us' },
  { value: 'ca', labelKey: 'formOptions.countries.ca' },
  { value: 'uk', labelKey: 'formOptions.countries.uk' },
  { value: 'au', labelKey: 'formOptions.countries.au' },
  { value: 'de', labelKey: 'formOptions.countries.de' },
  { value: 'fr', labelKey: 'formOptions.countries.fr' }
];

const frameworkOptions = [
  { value: 'next', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'svelte', label: 'SvelteKit' },
  { value: 'angular', label: 'Angular' }
];

const interestOptionKeys = [
  { value: 'technology', labelKey: 'formOptions.interests.technology' },
  { value: 'sports', labelKey: 'formOptions.interests.sports' },
  { value: 'music', labelKey: 'formOptions.interests.music' },
  { value: 'travel', labelKey: 'formOptions.interests.travel' },
  { value: 'cooking', labelKey: 'formOptions.interests.cooking' },
  { value: 'reading', labelKey: 'formOptions.interests.reading' }
];

const genderOptionKeys = [
  { value: 'male', labelKey: 'formOptions.genders.male' },
  { value: 'female', labelKey: 'formOptions.genders.female' },
  { value: 'other', labelKey: 'formOptions.genders.other' },
  { value: 'prefer-not-to-say', labelKey: 'formOptions.genders.preferNotToSay' }
];

interface SectionTitleProps {
  children: React.ReactNode;
}

function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className='space-y-1'>
      <Separator />
      <h3 className='text-muted-foreground pt-2 text-sm font-medium tracking-wide uppercase'>
        {children}
      </h3>
    </div>
  );
}

type DemoFormValues = {
  name: string;
  email: string;
  age?: number;
  password: string;
  phone: string;
  website: string;
  bio: string;
  country: string;
  framework: string;
  interests: string[];
  gender: string;
  newsletter: boolean;
  rating: number;
  birthDate?: Date;
  dateRange?: DateRange;
  eventTime?: string;
  favoriteColor?: string;
  otp: string;
  formatting?: string[];
  tags: string[];
  terms: boolean;
  avatar?: File[];
};

export default function DemoForm() {
  const t = useT();
  const countryOptions = countryOptionKeys.map(({ value, labelKey }) => ({
    value,
    label: translateMaybe(labelKey, t)
  }));
  const interestOptions = interestOptionKeys.map(({ value, labelKey }) => ({
    value,
    label: translateMaybe(labelKey, t)
  }));
  const genderOptions = genderOptionKeys.map(({ value, labelKey }) => ({
    value,
    label: translateMaybe(labelKey, t)
  }));

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      age: undefined,
      password: '',
      phone: '',
      website: '',
      bio: '',
      country: '',
      framework: '',
      interests: [],
      gender: '',
      newsletter: false,
      rating: 5,
      birthDate: undefined,
      dateRange: undefined,
      eventTime: '',
      favoriteColor: '#6366f1',
      otp: '',
      formatting: [],
      tags: [],
      terms: false,
      avatar: []
    } as DemoFormValues,
    validators: {
      onSubmit: demoFormSchema(t)
    },
    onSubmit: () => {
      toast.success(t('demoForm.submittedSuccess'));
    }
  });

  const formValues = useStore(form.store, (s) => s.values);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  return (
    <div className='grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>{t('demoForm.title')}</CardTitle>
          <p className='text-muted-foreground'>{t('demoForm.description')}</p>
        </CardHeader>
        <CardContent>
          <form
            className='space-y-6'
            noValidate
            aria-busy={isSubmitting}
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <SectionTitle>{t('demoForm.sectionText')}</SectionTitle>

            <FieldGroup className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <form.AppField
                name='name'
                children={(field) => (
                  <field.TextField label={t('demoForm.fullName')} required placeholder='John Doe' />
                )}
              />

              <form.AppField
                name='email'
                asyncDebounceMs={500}
                validators={{
                  onChangeAsync: async ({ value }) => {
                    if (!value || value.length < 3) return undefined;
                    await new Promise((r) => setTimeout(r, 500));
                    if (value === 'taken@example.com') {
                      return { message: t('demoFormZod.emailAlreadyRegistered') };
                    }
                    return undefined;
                  }
                }}
                children={(field) => (
                  <field.TextField
                    label={t('demoForm.email')}
                    required
                    type='email'
                    placeholder='john@example.com'
                  />
                )}
              />

              <form.AppField
                name='password'
                children={(field) => (
                  <field.TextField
                    label={t('demoForm.password')}
                    required
                    type='password'
                    placeholder={t('demoForm.passwordPlaceholder')}
                  />
                )}
              />

              <form.AppField
                name='age'
                children={(field) => (
                  <field.TextField
                    label={t('demoForm.age')}
                    required
                    type='number'
                    min={18}
                    max={100}
                    placeholder='18'
                  />
                )}
              />

              <form.AppField
                name='phone'
                children={(field) => (
                  <field.TextField
                    label={t('demoForm.phone')}
                    required
                    type='tel'
                    placeholder='+1 (555) 000-0000'
                  />
                )}
              />

              <form.AppField
                name='website'
                children={(field) => (
                  <field.TextField
                    label={t('demoForm.website')}
                    type='url'
                    placeholder='https://example.com'
                  />
                )}
              />
            </FieldGroup>

            <form.AppField
              name='bio'
              children={(field) => (
                <field.TextareaField
                  label={t('demoForm.bio')}
                  required
                  placeholder={t('demoForm.bioPlaceholder')}
                  maxLength={500}
                  rows={4}
                  showCount
                />
              )}
            />

            <SectionTitle>{t('demoForm.sectionSelect')}</SectionTitle>

            <FieldGroup className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <form.AppField
                name='country'
                children={(field) => (
                  <field.SelectField
                    label={t('demoForm.country')}
                    required
                    options={countryOptions}
                    placeholder={t('demoForm.countryPlaceholder')}
                  />
                )}
              />

              <form.AppField
                name='framework'
                children={(field) => (
                  <field.ComboboxField
                    label={t('demoForm.framework')}
                    required
                    description={t('demoForm.frameworkDesc')}
                    options={frameworkOptions}
                    placeholder={t('demoForm.frameworkPlaceholder')}
                  />
                )}
              />
            </FieldGroup>

            <SectionTitle>{t('demoForm.sectionCheckbox')}</SectionTitle>

            <form.AppField
              name='interests'
              mode='array'
              children={(field) => (
                <field.CheckboxGroupField
                  label={t('demoForm.interests')}
                  required
                  description={t('demoForm.interestsDesc')}
                  options={interestOptions}
                  className='grid grid-cols-2 gap-3 md:grid-cols-3'
                />
              )}
            />
            {formValues.interests.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {formValues.interests.map((v) => (
                  <Badge key={v} variant='secondary'>
                    {interestOptions.find((o) => o.value === v)?.label || v}
                  </Badge>
                ))}
              </div>
            )}

            <form.AppField
              name='gender'
              children={(field) => (
                <field.RadioGroupField
                  label={t('demoForm.gender')}
                  required
                  options={genderOptions}
                />
              )}
            />

            <SectionTitle>{t('demoForm.sectionToggle')}</SectionTitle>

            <form.AppField
              name='newsletter'
              children={(field) => (
                <field.SwitchField
                  label={t('demoForm.newsletter')}
                  description={t('demoForm.newsletterDesc')}
                />
              )}
            />

            <form.AppField
              name='formatting'
              mode='array'
              children={(field) => (
                <field.ToggleGroupField
                  label={t('demoForm.formatting')}
                  description={t('demoForm.formattingDesc')}
                >
                  <ToggleGroupItem value='bold' aria-label={t('demoForm.bold')}>
                    <Icons.bold className='h-4 w-4' />
                  </ToggleGroupItem>
                  <ToggleGroupItem value='italic' aria-label={t('demoForm.italic')}>
                    <Icons.italic className='h-4 w-4' />
                  </ToggleGroupItem>
                  <ToggleGroupItem value='underline' aria-label={t('demoForm.underline')}>
                    <Icons.underline className='h-4 w-4' />
                  </ToggleGroupItem>
                </field.ToggleGroupField>
              )}
            />

            <form.AppField
              name='terms'
              children={(field) => <field.CheckboxField label={t('demoForm.terms')} required />}
            />

            <SectionTitle>{t('demoForm.sectionSlider')}</SectionTitle>

            <form.AppField
              name='rating'
              children={(field) => (
                <field.SliderField
                  label={t('demoForm.rating')}
                  description={t('demoForm.ratingDesc')}
                  min={0}
                  max={10}
                  step={0.5}
                />
              )}
            />

            <SectionTitle>{t('demoForm.sectionDate')}</SectionTitle>

            <FieldGroup className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <form.AppField
                name='birthDate'
                children={(field) => (
                  <field.DatePickerField
                    label={t('demoForm.birthDate')}
                    disabledDates={(date) => date > new Date()}
                  />
                )}
              />

              <form.AppField
                name='eventTime'
                children={(field) => (
                  <field.TextField label={t('demoForm.eventTime')} type='time' />
                )}
              />
            </FieldGroup>

            <form.AppField
              name='dateRange'
              children={(field) => <field.DateRangeField label={t('demoForm.dateRange')} />}
            />

            <SectionTitle>{t('demoForm.sectionSpecial')}</SectionTitle>

            <FieldGroup className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <form.AppField
                name='otp'
                children={(field) => (
                  <field.OtpField
                    label={t('demoForm.verificationCode')}
                    required
                    description={t('demoForm.otpDesc')}
                  />
                )}
              />

              <form.AppField
                name='favoriteColor'
                children={(field) => (
                  <field.ColorField
                    label={t('demoForm.favoriteColor')}
                    description={t('demoForm.colorDesc')}
                  />
                )}
              />
            </FieldGroup>

            <form.AppField
              name='tags'
              mode='array'
              children={(field) => (
                <field.TagsField
                  label={t('demoForm.tags')}
                  required
                  description={t('demoForm.tagsDesc')}
                />
              )}
            />

            <SectionTitle>{t('demoForm.sectionFile')}</SectionTitle>

            <form.AppField
              name='avatar'
              children={(field) => (
                <field.FileUploadField
                  label={t('demoForm.profilePicture')}
                  description={t('demoForm.profilePictureDesc')}
                  maxSize={5000000}
                  maxFiles={1}
                />
              )}
            />

            <Separator />
            <div className='flex gap-4 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => form.reset()}
                className='flex-1'
              >
                {t('demoForm.reset')}
              </Button>
              <form.AppForm>
                <form.SubmitButton className='flex-1'>{t('demoForm.submit')}</form.SubmitButton>
              </form.AppForm>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className='xl:sticky xl:top-16 xl:self-start'>
        <Card>
          <CardHeader>
            <CardTitle>{t('demoForm.preview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className='bg-muted max-h-[calc(100vh-8rem)] overflow-auto rounded-lg p-4 text-xs'>
              {JSON.stringify(formValues, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
