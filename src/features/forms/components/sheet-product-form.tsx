'use client';

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
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { useT } from '@/i18n/use-t';

const categoryOptions = (t: (key: string) => string) => [
  { value: 'beauty', label: t('categories.beautyProducts') },
  { value: 'electronics', label: t('categories.electronics') },
  { value: 'home', label: t('categories.homeGarden') },
  { value: 'sports', label: t('categories.sportsOutdoors') }
];

export default function SheetProductForm() {
  const [open, setOpen] = useState(false);
  const t = useT();

  const productSchema = z.object({
    name: z.string().min(2, t('productSchemaZod.nameMin2')),
    category: z.string().min(1, t('productSchemaZod.categoryRequired')),
    price: z
      .number({ error: t('productSchemaZod.priceRequired') })
      .min(0.01, t('sheetFormZod.priceMin')),
    description: z.string().min(10, t('productSchemaZod.descriptionMin10'))
  });

  const form = useAppForm({
    defaultValues: {
      name: '',
      category: '',
      price: undefined as number | undefined,
      description: ''
    },
    validators: {
      onSubmit: productSchema
    },
    onSubmit: () => {
      toast.success(t('demo.productCreated'));
      setOpen(false);
      form.reset();
    }
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button />}>
        <Icons.add className='ms-2 h-4 w-4' />
        {t('common.addProduct')}
      </SheetTrigger>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>{t('demo.newProduct')}</SheetTitle>
          <SheetDescription>{t('demo.fillDetailsCreateProduct')}</SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='sheet-product-form'
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
                    step='0.01'
                    placeholder={t('common.enterPrice')}
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
                    showCount
                  />
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <form.AppForm>
            <Button type='button' variant='outline' onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <form.SubmitButton type='submit' form='sheet-product-form'>
              {t('common.createProduct')}
            </form.SubmitButton>
          </form.AppForm>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
