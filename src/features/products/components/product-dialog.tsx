'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { fromPaisa, toPaisa } from '@/lib/dukaan/numbers';
import type { ProductDTO, ProductImageDTO } from '@/lib/api/types';
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';
import { FormEntitySelect } from '@/components/forms/form-entity-select';

import { useCreateProduct, useUpdateProduct } from '../api/mutations';
import { productsQueryKeys, useProductImagesQuery } from '../api/queries';
import { productFormSchema, type ProductFormValues } from '../schemas/product-schema';
import { ProductPhotoManager } from './product-photo-manager';
import { listCategories } from '@/features/categories/api/service';
import { listBrands } from '@/features/brands/api/service';
import type { ProductDialogProps, ProductDialogBodyProps } from '@/types/products';

function emptyProductForm(): ProductFormValues {
  return {
    name: '',
    categoryId: '',
    brandId: '',
    trackingType: 'QUANTITY',
    defaultPurchasePrice: 0,
    defaultSellingPrice: 0,
    lowStockThreshold: 5,
    model: '',
    color: '',
    ram: '',
    storage: '',
    sku: '',
    barcode: '',
    description: '',
    imageUrl: '',
    isActive: true,
    isPublished: false,
    publicDescription: '',
    contactForPrice: false,
    ptaStatus: null
  };
}

function productToForm(product: ProductDTO): ProductFormValues {
  return {
    name: product.name,
    categoryId: product.categoryId,
    brandId: product.brandId,
    trackingType: product.trackingType,
    defaultPurchasePrice: fromPaisa(product.defaultPurchasePrice),
    defaultSellingPrice: fromPaisa(product.defaultSellingPrice),
    lowStockThreshold: product.lowStockThreshold,
    model: product.model ?? '',
    color: product.color ?? '',
    ram: product.ram ?? '',
    storage: product.storage ?? '',
    sku: product.sku ?? '',
    barcode: product.barcode ?? '',
    description: product.description ?? '',
    imageUrl: product.imageUrl ?? '',
    isActive: product.isActive,
    isPublished: product.isPublished,
    publicDescription: product.publicDescription ?? '',
    contactForPrice: product.contactForPrice,
    ptaStatus: product.ptaStatus ?? null
  };
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <ProductDialogBody
          key={product?.id ?? 'new'}
          product={product}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

function ProductDialogBody({ product, onOpenChange }: ProductDialogBodyProps) {
  const qc = useQueryClient();
  const t = useTranslations('dukaan.product');
  const isEdit = Boolean(product);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.id ?? '');

  const { data: imagesData } = useProductImagesQuery(product?.id ?? '', undefined, {
    enabled: isEdit && !!product?.id
  });
  const [images, setImages] = useState<ProductImageDTO[]>([]);

  useEffect(() => {
    if (imagesData?.items) {
      setImages(imagesData.items);
    }
  }, [imagesData]);

  const form = useAppForm({
    defaultValues: product ? productToForm(product) : emptyProductForm(),
    validators: {
      onSubmit: ({ value }) => {
        const result = productFormSchema.safeParse(value);
        if (!result.success) {
          const firstError = result.error.issues[0]?.message ?? 'Please check required fields';
          toast.error(firstError);
          return firstError;
        }
        return undefined;
      }
    },
    onSubmit: ({ value }) => {
      const cleanString = (val?: string | null) => {
        const trimmed = val?.trim();
        return trimmed ? trimmed : undefined;
      };

      if (product) {
        updateProduct.mutate(
          {
            name: value.name.trim(),
            categoryId: value.categoryId,
            brandId: value.brandId,
            defaultPurchasePrice: toPaisa(Number(value.defaultPurchasePrice || 0)),
            defaultSellingPrice: toPaisa(Number(value.defaultSellingPrice || 0)),
            lowStockThreshold: Number(value.lowStockThreshold || 0),
            model: cleanString(value.model),
            color: cleanString(value.color),
            ram: cleanString(value.ram),
            storage: cleanString(value.storage),
            sku: cleanString(value.sku),
            barcode: cleanString(value.barcode),
            description: cleanString(value.description),
            imageUrl: cleanString(value.imageUrl),
            isActive: value.isActive ?? true,
            isPublished: value.isPublished ?? false,
            publicDescription: cleanString(value.publicDescription),
            contactForPrice: value.contactForPrice ?? false,
            ptaStatus: value.ptaStatus || undefined
          },
          {
            onSuccess: () => {
              void qc.invalidateQueries({ queryKey: productsQueryKeys.all });
              onOpenChange(false);
            },
            onError: (err: Error) => {
              toast.error(err.message || t('updateFailed'));
            }
          }
        );
      } else {
        createProduct.mutate(
          {
            name: value.name.trim(),
            categoryId: value.categoryId,
            brandId: value.brandId,
            trackingType: value.trackingType,
            defaultPurchasePrice: toPaisa(Number(value.defaultPurchasePrice || 0)),
            defaultSellingPrice: toPaisa(Number(value.defaultSellingPrice || 0)),
            lowStockThreshold: Number(value.lowStockThreshold || 0),
            model: cleanString(value.model),
            color: cleanString(value.color),
            ram: cleanString(value.ram),
            storage: cleanString(value.storage),
            sku: cleanString(value.sku),
            barcode: cleanString(value.barcode),
            description: cleanString(value.description),
            imageUrl: cleanString(value.imageUrl),
            isActive: true
          },
          {
            onSuccess: () => {
              void qc.invalidateQueries({ queryKey: productsQueryKeys.all });
              onOpenChange(false);
            },
            onError: (err: Error) => {
              toast.error(err.message || t('createFailed'));
            }
          }
        );
      }
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <DialogContent className='flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl'>
      <DialogHeader className='shrink-0 px-4 pt-4 pe-12'>
        <DialogTitle>{isEdit ? t('editTitle') : t('addTitle')}</DialogTitle>
        <DialogDescription>{isEdit ? t('editDescription') : t('addDescription')}</DialogDescription>
      </DialogHeader>
      <form className='flex min-h-0 flex-1 flex-col' onSubmit={handleSubmit}>
        <div className='no-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-4'>
          <FieldGroup className='gap-4'>
            <form.AppField
              name='name'
              children={(field) => <field.TextField label={t('name')} required />}
            />
            <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
              <form.Field
                name='categoryId'
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <FormEntitySelect
                      name={field.name}
                      label={t('category')}
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onValueChange={(id) => field.handleChange(id)}
                      isInvalid={isInvalid}
                      errors={field.state.meta.errors}
                      queryKey={['categories', 'infinite-select']}
                      fetchPage={async (filters) => {
                        const res = await listCategories(filters);
                        return {
                          items: res.items,
                          total: res.total,
                          page: res.page,
                          limit: res.pageSize
                        };
                      }}
                      placeholder={t('selectCategory')}
                      searchPlaceholder={t('searchCategories')}
                    />
                  );
                }}
              />
              <form.Field
                name='brandId'
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <FormEntitySelect
                      name={field.name}
                      label={t('brand')}
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onValueChange={(id) => field.handleChange(id)}
                      isInvalid={isInvalid}
                      errors={field.state.meta.errors}
                      queryKey={['brands', 'infinite-select']}
                      fetchPage={async (filters) => {
                        const res = await listBrands(filters);
                        return {
                          items: res.items,
                          total: res.total,
                          page: res.page,
                          limit: res.pageSize
                        };
                      }}
                      placeholder={t('selectBrand')}
                      searchPlaceholder={t('searchBrands')}
                    />
                  );
                }}
              />
            </div>

            {!isEdit ? (
              <form.AppField
                name='trackingType'
                children={(field) => (
                  <field.SelectField
                    label={t('trackingType')}
                    required
                    options={[
                      { value: 'QUANTITY', label: t('quantity') },
                      { value: 'SERIALIZED', label: t('serialized') }
                    ]}
                  />
                )}
              />
            ) : null}

            <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
              <form.AppField
                name='defaultPurchasePrice'
                children={(field) => (
                  <field.TextField label={t('purchasePrice')} type='number' required />
                )}
              />
              <form.AppField
                name='defaultSellingPrice'
                children={(field) => (
                  <field.TextField label={t('sellingPrice')} type='number' required />
                )}
              />
            </div>

            <form.Subscribe
              selector={(state) => state.values.trackingType}
              children={(trackingType) => (
                <>
                  <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
                    <form.AppField
                      name='model'
                      children={(field) => (
                        <field.TextField
                          label={t('model')}
                          placeholder={trackingType === 'SERIALIZED' ? 'e.g. SM-A155F' : undefined}
                        />
                      )}
                    />
                    <form.AppField
                      name='color'
                      children={(field) => <field.TextField label={t('color')} />}
                    />
                  </div>
                  {trackingType === 'SERIALIZED' && (
                    <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
                      <form.AppField
                        name='ram'
                        children={(field) => (
                          <field.TextField label={t('ram')} placeholder={t('ramPlaceholder')} />
                        )}
                      />
                      <form.AppField
                        name='storage'
                        children={(field) => (
                          <field.TextField
                            label={t('storage')}
                            placeholder={t('storagePlaceholder')}
                          />
                        )}
                      />
                    </div>
                  )}
                  {isEdit && trackingType === 'SERIALIZED' && (
                    <form.AppField
                      name='ptaStatus'
                      children={(field) => (
                        <field.SelectField
                          label={t('ptaStatus')}
                          options={[
                            { value: 'PTA_APPROVED', label: t('ptaApproved') },
                            { value: 'NON_PTA', label: t('nonPta') }
                          ]}
                        />
                      )}
                    />
                  )}
                </>
              )}
            />

            <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
              <form.AppField
                name='sku'
                children={(field) => <field.TextField label={t('sku')} />}
              />
              <form.AppField
                name='barcode'
                children={(field) => <field.TextField label={t('barcode')} />}
              />
            </div>
            <form.AppField
              name='lowStockThreshold'
              children={(field) => (
                <field.TextField label={t('lowStockThreshold')} type='number' required />
              )}
            />
            <form.AppField
              name='description'
              children={(field) => <field.TextareaField label={t('description')} />}
            />

            {isEdit && (
              <>
                <div className='border-t pt-4'>
                  <h4 className='text-sm font-semibold mb-3'>{t('onlineStoreSettings')}</h4>
                  <form.AppField
                    name='publicDescription'
                    children={(field) => <field.TextareaField label={t('publicDescription')} />}
                  />
                  <div className='grid min-w-0 gap-4 sm:grid-cols-2 mt-3'>
                    <form.AppField
                      name='isPublished'
                      children={(field) => <field.CheckboxField label={t('isPublished')} />}
                    />
                    <form.AppField
                      name='contactForPrice'
                      children={(field) => <field.CheckboxField label={t('contactForPrice')} />}
                    />
                  </div>
                </div>
              </>
            )}
          </FieldGroup>

          {isEdit && product?.id ? (
            <div className='mt-6 border-t pt-4'>
              <h4 className='text-sm font-semibold mb-3'>{t('images')}</h4>
              <ProductPhotoManager productId={product.id} images={images} onChange={setImages} />
            </div>
          ) : null}
        </div>
        <DialogFooter className='mx-0 mb-0 shrink-0'>
          <DialogCancelButton
            onClick={() => onOpenChange(false)}
            disabled={createProduct.isPending || updateProduct.isPending}
          />
          <DialogPrimaryButton
            mode={isEdit ? 'edit' : 'add'}
            loading={createProduct.isPending || updateProduct.isPending}
          />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
