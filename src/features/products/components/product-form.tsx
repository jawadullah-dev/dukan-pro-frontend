'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { categoryOptions } from '@/features/products/constants/product-options';
import { productSchema, type ProductFormValues } from '@/features/products/schemas/product';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createProductMutation, updateProductMutation } from '../api/mutations';
import type { Product } from '../api/types';
import { translateMaybe } from '@/i18n/use-t';

export default function ProductForm({
  initialData,
  pageTitle
}: {
  initialData: Product | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!initialData;
  const t = useTranslations();

  const createMutation = useMutation({
    ...createProductMutation,
    onSuccess: () => {
      toast.success(t('common.productCreated'));
      router.push('/dashboard/product');
    },
    onError: () => {
      toast.error(t('common.productCreateFailed'));
    }
  });

  const updateMutation = useMutation({
    ...updateProductMutation,
    onSuccess: () => {
      toast.success(t('common.productUpdated'));
      router.push('/dashboard/product');
    },
    onError: () => {
      toast.error(t('common.productUpdateFailed'));
    }
  });

  const form = useAppForm({
    defaultValues: {
      image: undefined,
      name: initialData?.name ?? '',
      category: initialData?.category ?? '',
      price: initialData?.price,
      description: initialData?.description ?? ''
    } as ProductFormValues,
    validators: {
      onSubmit: productSchema(t)
    },
    onSubmit: ({ value }) => {
      const payload = {
        name: value.name,
        category: value.category,
        price: value.price!,
        description: value.description
      };

      if (isEdit) {
        updateMutation.mutate({ id: initialData.id, values: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className='mx-auto w-full max-w-3xl'>
      <CardHeader>
        <CardTitle className='text-start text-2xl font-bold'>
          {translateMaybe(pageTitle, t)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className='space-y-8'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField
              name='image'
              children={(field) => (
                <field.FileUploadField
                  label={t('common.productImage')}
                  description={t('common.uploadProductImage')}
                  maxSize={5 * 1024 * 1024}
                  maxFiles={4}
                />
              )}
            />

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
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
                    options={categoryOptions.map(({ value, labelKey }) => ({
                      value,
                      label: t(labelKey as never)
                    }))}
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
            </div>

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

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={isPending}
              onClick={() => router.back()}
            >
              {t('common.cancel')}
            </Button>
            <LoadingButton loading={isPending} type='submit'>
              {isEdit ? t('common.updateProduct') : t('common.addProduct')}
            </LoadingButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
