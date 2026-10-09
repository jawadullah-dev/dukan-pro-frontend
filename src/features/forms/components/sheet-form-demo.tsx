'use client';

import { useState } from 'react';
import { useAppForm } from '@/lib/form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { useT } from '@/i18n/use-t';

const categoryOptions = (t: (key: string) => string) => [
  { value: 'beauty', label: t('categories.beautyProducts') },
  { value: 'electronics', label: t('categories.electronics') },
  { value: 'home', label: t('categories.homeGarden') },
  { value: 'sports', label: t('categories.sportsOutdoors') }
];

function SheetFormSection() {
  const [open, setOpen] = useState(false);
  const t = useT();

  const sheetFormSchema = z.object({
    name: z.string().min(2, t('sheetFormZod.nameMin2')),
    category: z.string().min(1, t('sheetFormZod.categoryRequired')),
    price: z
      .number({ error: t('sheetFormZod.priceRequired') })
      .min(0.01, t('sheetFormZod.priceMin')),
    description: z.string().min(10, t('sheetFormZod.descriptionMin10'))
  });

  const form = useAppForm({
    defaultValues: {
      name: '',
      category: '',
      price: undefined as number | undefined,
      description: ''
    },
    validators: {
      onSubmit: sheetFormSchema
    },
    onSubmit: ({ value }) => {
      toast.success(t('demo.productCreated'), {
        description: t('demo.productAdded', { name: value.name })
      });
      setOpen(false);
      form.reset();
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('demo.sheetForm')}</CardTitle>
        <CardDescription>{t('demo.sheetFormDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button />}>
            <Icons.add className='ms-2 h-4 w-4' />
            {t('common.addProduct')}
          </SheetTrigger>
          <SheetContent className='flex flex-col'>
            <SheetHeader>
              <SheetTitle>{t('demo.newProduct')}</SheetTitle>
              <SheetDescription>{t('demo.fillDetailsBelowCreateProduct')}</SheetDescription>
            </SheetHeader>

            <form
              id='sheet-form-id'
              className='space-y-4 p-4 md:p-4'
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup>
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
                      placeholder={t('demo.selectCategory')}
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
                      step='0.01'
                      placeholder='0.00'
                    />
                  )}
                />

                <form.AppField
                  name='description'
                  children={(field) => (
                    <field.TextareaField
                      label={t('common.description')}
                      required
                      placeholder={t('common.enterProductDescription')}
                      maxLength={500}
                      rows={4}
                    />
                  )}
                />
              </FieldGroup>
            </form>

            <SheetFooter className='pt-4'>
              <form.AppForm>
                <Button type='button' variant='outline' onClick={() => setOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <form.SubmitButton type='submit' form='sheet-form-id'>
                  {t('common.createProduct')}
                </form.SubmitButton>
              </form.AppForm>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
}

function DialogFormSection() {
  const [open, setOpen] = useState(false);
  const t = useT();

  const dialogFormSchema = z.object({
    rating: z.number().min(0).max(10),
    feedback: z.string().min(5, t('sheetFormZod.feedbackMin5'))
  });

  const form = useAppForm({
    defaultValues: {
      rating: 5,
      feedback: ''
    },
    validators: {
      onSubmit: dialogFormSchema
    },
    onSubmit: ({ value }) => {
      toast.success(t('demo.ratingSubmitted'), {
        description: t('demo.ratingSubmitted', { rating: value.rating })
      });
      setOpen(false);
      form.reset();
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('demo.dialogForm')}</CardTitle>
        <CardDescription>{t('demo.dialogFormDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant='outline' />}>
            <Icons.send className='ms-2 h-4 w-4' />
            {t('demo.sendFeedback')}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('demo.quickFeedback')}</DialogTitle>
              <DialogDescription>{t('demo.rateExperience')}</DialogDescription>
            </DialogHeader>

            <form
              id='dialog-form-id'
              className='space-y-4 py-2'
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup>
                <form.AppField
                  name='rating'
                  children={(field) => (
                    <field.SliderField
                      label={t('demo.rating')}
                      description={t('demo.ratingDescription')}
                      min={0}
                      max={10}
                      step={1}
                    />
                  )}
                />

                <form.AppField
                  name='feedback'
                  children={(field) => (
                    <field.TextareaField
                      label={t('demo.feedback')}
                      required
                      placeholder={t('demo.feedbackPlaceholder')}
                      maxLength={300}
                      rows={3}
                    />
                  )}
                />
              </FieldGroup>
            </form>

            <DialogFooter>
              <form.AppForm>
                <Button type='button' variant='outline' onClick={() => setOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <form.SubmitButton type='submit' form='dialog-form-id'>
                  {t('demo.submitFeedback')}
                </form.SubmitButton>
              </form.AppForm>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function ToastDemoSection() {
  const t = useT();
  return (
    <Card className='md:col-span-2'>
      <CardHeader>
        <CardTitle>{t('demo.toastNotifications')}</CardTitle>
        <CardDescription>{t('demo.toastNotificationsDescription')}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-wrap gap-2'>
        <Button variant='outline' onClick={() => toast(t('demo.defaultToast'))}>
          {t('demo.default')}
        </Button>
        <Button variant='outline' onClick={() => toast.success(t('demo.successToast'))}>
          <Icons.circleCheck className='ms-2 h-4 w-4' />
          {t('demo.success')}
        </Button>
        <Button variant='outline' onClick={() => toast.error(t('demo.errorToast'))}>
          <Icons.circleX className='ms-2 h-4 w-4' />
          {t('demo.error')}
        </Button>
        <Button variant='outline' onClick={() => toast.warning(t('demo.warningToast'))}>
          <Icons.warning className='ms-2 h-4 w-4' />
          {t('demo.warning')}
        </Button>
        <Button variant='outline' onClick={() => toast.info(t('demo.infoToast'))}>
          <Icons.info className='ms-2 h-4 w-4' />
          {t('demo.info')}
        </Button>
        <Button
          variant='outline'
          onClick={() =>
            toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
              loading: t('demo.loading'),
              success: t('demo.dataLoaded'),
              error: t('demo.failedToLoad')
            })
          }
        >
          <Icons.spinner className='ms-2 h-4 w-4' />
          {t('demo.promise')}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SheetFormDemo() {
  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <SheetFormSection />
      <DialogFormSection />
      <ToastDemoSection />
    </div>
  );
}
