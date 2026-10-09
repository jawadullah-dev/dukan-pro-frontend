'use client';

import * as React from 'react';
import { revalidateLogic, useStore } from '@tanstack/react-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Icons } from '@/components/icons';
import { FieldDescription, FieldGroup } from '@/components/ui/field';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { useAppForm } from '@/lib/form';
import { useFormStepper } from '@/hooks/use-stepper';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useT } from '@/i18n/use-t';

const createProductFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t('schemaZod.productNameMin2')),
    category: z.string().min(1, t('schemaZod.categoryRequired')),
    price: z.number({ error: t('schemaZod.priceRequired') }).min(0.01, t('schemaZod.priceMin')),
    description: z.string().min(10, t('schemaZod.descriptionMin10'))
  });

const stepSchemas = (t: (key: string) => string) => {
  const productFormSchema = createProductFormSchema(t);

  return [
    productFormSchema.pick({ name: true, category: true, price: true }),

    productFormSchema.pick({ description: true }),

    z.object({})
  ];
};

const categoryOptions = (t: (key: string) => string) => [
  { value: 'beauty', label: t('categories.beautyProducts') },
  { value: 'electronics', label: t('categories.electronics') },
  { value: 'home', label: t('categories.homeGarden') },
  { value: 'sports', label: t('categories.sportsOutdoors') }
];

interface ReviewSummaryValues {
  name: string;
  category: string;
  price?: number;
  description: string;
}

interface ReviewSummaryProps {
  values: ReviewSummaryValues;
}

function ReviewSummary({ values }: ReviewSummaryProps) {
  const t = useT();
  return (
    <div className='space-y-3'>
      <Separator />
      <div className='grid gap-3'>
        <div>
          <p className='text-muted-foreground text-xs font-medium uppercase'>
            {t('dukaan.party.name')}
          </p>
          <p className='text-sm'>{values.name || '—'}</p>
        </div>
        <div>
          <p className='text-muted-foreground text-xs font-medium uppercase'>
            {t('common.category')}
          </p>
          <p className='text-sm capitalize'>{values.category || '—'}</p>
        </div>
        <div>
          <p className='text-muted-foreground text-xs font-medium uppercase'>{t('common.price')}</p>
          <p className='text-sm'>{values.price != null ? `$${values.price}` : '—'}</p>
        </div>
        <div>
          <p className='text-muted-foreground text-xs font-medium uppercase'>
            {t('common.description')}
          </p>
          <p className='text-sm'>{values.description || '—'}</p>
        </div>
      </div>
    </div>
  );
}

type ProductFormValues = {
  name: string;
  category: string;
  price: number | undefined;
  description: string;
};

export default function MultiStepProductForm() {
  const t = useT();
  const productFormSchema = createProductFormSchema(t);
  const {
    currentValidator,
    step,
    currentStep,
    isFirstStep,
    handleCancelOrBack,
    handleNextStepOrSubmit
  } = useFormStepper(stepSchemas(t), { fullSchema: productFormSchema });

  const form = useAppForm({
    defaultValues: {
      name: '',
      category: '',
      price: undefined,
      description: ''
    } as ProductFormValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: currentValidator as typeof productFormSchema,
      onDynamicAsyncDebounceMs: 500
    },
    onSubmit: () => {
      toast.success(t('forms.createSuccess'));
    }
  });

  const isDefault = useStore(form.store, (state) => state.isDefaultValue);
  const formValues = useStore(form.store, (state) => state.values);

  const handleNext = async () => {
    await handleNextStepOrSubmit(form);
  };

  const totalSteps = 3;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void handleNext();
      }}
      noValidate
      className='mx-auto flex w-full flex-col gap-2 p-0'
    >
      <div className='flex flex-col gap-2 pt-3'>
        <div className='flex flex-col items-center justify-start gap-1'>
          <span className='text-muted-foreground text-sm'>
            {t('steps.stepOf', { current: currentStep, total: totalSteps })}
          </span>
          <Progress value={(currentStep / totalSteps) * 100} />
        </div>

        <AnimatePresence mode='popLayout'>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.4, type: 'spring' }}
            className='flex flex-col gap-2'
          >
            {currentStep === 1 && (
              <FieldGroup className='space-y-4'>
                <h3 className='text-lg font-semibold'>{t('pages.forms.basicInfo')}</h3>
                <FieldDescription>{t('pages.forms.basicInfoDescription')}</FieldDescription>

                <form.AppField
                  name='name'
                  children={(field) => (
                    <field.TextField
                      label={t('common.productName')}
                      required
                      placeholder={t('common.enterProductName')}
                    />
                  )}
                />

                <form.AppField
                  name='category'
                  children={(field) => (
                    <field.SelectField
                      label={t('common.category')}
                      required
                      options={categoryOptions(t)}
                      placeholder={t('common.selectCategory')}
                    />
                  )}
                />

                <form.AppField
                  name='price'
                  children={(field) => (
                    <field.TextField
                      label={t('common.price')}
                      required
                      type='number'
                      min={0}
                      step={0.01}
                      placeholder={t('common.enterPrice')}
                    />
                  )}
                />
              </FieldGroup>
            )}

            {currentStep === 2 && (
              <FieldGroup className='space-y-4'>
                <h3 className='text-lg font-semibold'>{t('pages.forms.details')}</h3>
                <FieldDescription>{t('pages.forms.detailsDescription')}</FieldDescription>

                <form.AppField
                  name='description'
                  children={(field) => (
                    <field.TextareaField
                      label={t('common.description')}
                      required
                      placeholder={t('common.enterProductDescription')}
                      maxLength={500}
                      rows={5}
                    />
                  )}
                />
              </FieldGroup>
            )}

            {currentStep === 3 && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>{t('pages.forms.reviewSubmit')}</h3>
                <FieldDescription>{t('pages.forms.reviewDescription')}</FieldDescription>
                <ReviewSummary values={formValues} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className='flex w-full items-center justify-between gap-3 pt-3'>
          <Button
            size='sm'
            variant='ghost'
            type='button'
            disabled={isFirstStep}
            onClick={() => handleCancelOrBack({ onBack: () => {} })}
          >
            <Icons.chevronLeft className='rtl:rotate-180' /> {t('common.back')}
          </Button>
          <div className='flex w-full items-center justify-end gap-3 pt-3'>
            {!isDefault && (
              <Button
                type='button'
                onClick={() => form.reset()}
                className='rounded-lg'
                variant='outline'
                size='sm'
              >
                {t('appearance.reset')}
              </Button>
            )}
            {step.isCompleted ? (
              <form.AppForm>
                <form.SubmitButton type='submit'>{t('common.confirm')}</form.SubmitButton>
              </form.AppForm>
            ) : (
              <Button size='sm' variant='ghost' type='button' onClick={() => void handleNext()}>
                {t('common.continue')} <Icons.chevronRight className='rtl:rotate-180' />
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
