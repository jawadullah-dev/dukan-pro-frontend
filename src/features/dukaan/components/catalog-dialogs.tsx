'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useT } from '@/i18n/use-t';
import { toast } from 'sonner';
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
import { dukaan } from '@/lib/dukaan';
import { fromPaisa, toPaisa } from '@/lib/dukaan/numbers';
import type { Brand, Category, Product } from '@/lib/dukaan/types';
import { dukaanKeys } from '../api/queries';
import {
  createNameOnlySchema,
  createProductFormSchema,
  type ProductFormValues
} from '../schemas/forms';
import { DialogCancelButton, DialogPrimaryButton } from './dialog-actions';
import { FormEntitySelect } from './form-entity-select';

interface NameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CategoryDialogProps extends NameDialogProps {
  category?: Category | null;
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <CategoryDialogBody
          key={category?.id ?? 'new'}
          category={category}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

interface CategoryDialogBodyProps {
  category?: Category | null;
  onOpenChange: (open: boolean) => void;
}

function CategoryDialogBody({ category, onOpenChange }: CategoryDialogBodyProps) {
  const qc = useQueryClient();
  const isEdit = Boolean(category);
  const t = useT();

  const save = useMutation({
    mutationFn: async (name: string) => {
      if (category) return dukaan.updateCategory(category.id, { name });
      return dukaan.createCategory(name);
    },
    onSuccess: () => {
      toast.success(isEdit ? t('dukaan.category.updated') : t('dukaan.category.created'));
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { name: category?.name ?? '' },
    validators: { onSubmit: createNameOnlySchema(t) },
    onSubmit: ({ value }) => {
      save.mutate(value.name.trim());
    }
  });

  return (
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader className='pe-12'>
        <DialogTitle>
          {isEdit ? t('dukaan.category.editTitle') : t('dukaan.category.addTitle')}
        </DialogTitle>
        <DialogDescription>
          {isEdit ? t('dukaan.category.editDescription') : t('dukaan.category.addDescription')}
        </DialogDescription>
      </DialogHeader>
      <form
        className='grid gap-4'
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.AppField
            name='name'
            children={(field) => (
              <field.TextField
                label={t('dukaan.party.name')}
                required
                placeholder={t('dukaan.category.namePlaceholder')}
                autoFocus
              />
            )}
          />
        </FieldGroup>
        <DialogFooter>
          <DialogCancelButton onClick={() => onOpenChange(false)} disabled={save.isPending} />
          <DialogPrimaryButton mode={isEdit ? 'edit' : 'add'} loading={save.isPending} />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

interface BrandDialogProps extends NameDialogProps {
  brand?: Brand | null;
}

export function BrandDialog({ open, onOpenChange, brand }: BrandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <BrandDialogBody key={brand?.id ?? 'new'} brand={brand} onOpenChange={onOpenChange} />
      ) : null}
    </Dialog>
  );
}

interface BrandDialogBodyProps {
  brand?: Brand | null;
  onOpenChange: (open: boolean) => void;
}

function BrandDialogBody({ brand, onOpenChange }: BrandDialogBodyProps) {
  const qc = useQueryClient();
  const isEdit = Boolean(brand);
  const t = useT();

  const save = useMutation({
    mutationFn: async (name: string) => {
      if (brand) return dukaan.updateBrand(brand.id, { name });
      return dukaan.createBrand(name);
    },
    onSuccess: () => {
      toast.success(isEdit ? t('dukaan.brand.updated') : t('dukaan.brand.created'));
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { name: brand?.name ?? '' },
    validators: { onSubmit: createNameOnlySchema(t) },
    onSubmit: ({ value }) => {
      save.mutate(value.name.trim());
    }
  });

  return (
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader className='pe-12'>
        <DialogTitle>
          {isEdit ? t('dukaan.brand.editTitle') : t('dukaan.brand.addTitle')}
        </DialogTitle>
        <DialogDescription>
          {isEdit ? t('dukaan.brand.editDescription') : t('dukaan.brand.addDescription')}
        </DialogDescription>
      </DialogHeader>
      <form
        className='grid gap-4'
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.AppField
            name='name'
            children={(field) => (
              <field.TextField
                label={t('dukaan.party.name')}
                required
                placeholder={t('dukaan.brand.namePlaceholder')}
                autoFocus
              />
            )}
          />
        </FieldGroup>
        <DialogFooter>
          <DialogCancelButton onClick={() => onOpenChange(false)} disabled={save.isPending} />
          <DialogPrimaryButton mode={isEdit ? 'edit' : 'add'} loading={save.isPending} />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

interface ProductDialogProps extends NameDialogProps {
  product?: Product | null;
}

function emptyProductForm(): ProductFormValues {
  return {
    name: '',
    category_id: '',
    brand_id: '',
    tracking_type: 'QUANTITY',
    default_purchase_price: 0,
    default_selling_price: 0,
    low_stock_threshold: 5,
    model: '',
    color: '',
    ram: '',
    storage: '',
    sku: '',
    barcode: '',
    description: ''
  };
}

function productToForm(product: Product): ProductFormValues {
  return {
    name: product.name,
    category_id: product.category_id,
    brand_id: product.brand_id,
    tracking_type: product.tracking_type,
    default_purchase_price: fromPaisa(product.default_purchase_price),
    default_selling_price: fromPaisa(product.default_selling_price),
    low_stock_threshold: product.low_stock_threshold,
    model: product.model ?? '',
    color: product.color ?? '',
    ram: product.ram ?? '',
    storage: product.storage ?? '',
    sku: product.sku ?? '',
    barcode: product.barcode ?? '',
    description: product.description ?? ''
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

interface ProductDialogBodyProps {
  product?: Product | null;
  onOpenChange: (open: boolean) => void;
}

function ProductDialogBody({ product, onOpenChange }: ProductDialogBodyProps) {
  const qc = useQueryClient();
  const isEdit = Boolean(product);
  const t = useT();

  const save = useMutation({
    mutationFn: async (value: ProductFormValues) => {
      const optional = {
        model: value.model || undefined,
        color: value.color || undefined,
        ram: value.ram || undefined,
        storage: value.storage || undefined,
        sku: value.sku || undefined,
        barcode: value.barcode || undefined,
        description: value.description || undefined
      };
      if (product) {
        return dukaan.updateProduct(product.id, {
          name: value.name.trim(),
          category_id: value.category_id,
          brand_id: value.brand_id,
          default_purchase_price: toPaisa(value.default_purchase_price),
          default_selling_price: toPaisa(value.default_selling_price),
          low_stock_threshold: value.low_stock_threshold,
          ...optional
        });
      }
      return dukaan.createProduct({
        name: value.name.trim(),
        category_id: value.category_id,
        brand_id: value.brand_id,
        tracking_type: value.tracking_type,
        default_purchase_price: toPaisa(value.default_purchase_price),
        default_selling_price: toPaisa(value.default_selling_price),
        low_stock_threshold: value.low_stock_threshold,
        ...optional
      });
    },
    onSuccess: () => {
      toast.success(isEdit ? t('dukaan.product.updated') : t('dukaan.product.created'));
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: product ? productToForm(product) : emptyProductForm(),
    validators: { onSubmit: createProductFormSchema(t) },
    onSubmit: ({ value }) => {
      save.mutate(value);
    }
  });

  return (
    <DialogContent className='flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl'>
      <DialogHeader className='shrink-0 px-4 pt-4 pe-12'>
        <DialogTitle>
          {isEdit ? t('dukaan.product.editTitle') : t('dukaan.product.addTitle')}
        </DialogTitle>
        <DialogDescription>
          {isEdit ? t('dukaan.product.editDescription') : t('dukaan.product.addDescription')}
        </DialogDescription>
      </DialogHeader>
      <form
        className='flex min-h-0 flex-1 flex-col'
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <div className='no-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-4'>
          <FieldGroup className='gap-4'>
            <form.AppField
              name='name'
              children={(field) => <field.TextField label={t('dukaan.product.name')} required />}
            />
            <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
              <form.Field
                name='category_id'
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <FormEntitySelect
                      name={field.name}
                      label={t('dukaan.product.category')}
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onValueChange={(id) => field.handleChange(id)}
                      isInvalid={isInvalid}
                      errors={field.state.meta.errors}
                      queryKey={dukaanKeys.categories()}
                      fetchPage={(filters) => dukaan.listCategories(filters)}
                      placeholder={t('dukaan.product.selectCategory')}
                      searchPlaceholder={t('dukaan.product.searchCategories')}
                    />
                  );
                }}
              />
              <form.Field
                name='brand_id'
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <FormEntitySelect
                      name={field.name}
                      label={t('dukaan.product.brand')}
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onValueChange={(id) => field.handleChange(id)}
                      isInvalid={isInvalid}
                      errors={field.state.meta.errors}
                      queryKey={dukaanKeys.brands()}
                      fetchPage={(filters) => dukaan.listBrands(filters)}
                      placeholder={t('dukaan.product.selectBrand')}
                      searchPlaceholder={t('dukaan.product.searchBrands')}
                    />
                  );
                }}
              />
            </div>
            {!isEdit ? (
              <form.AppField
                name='tracking_type'
                children={(field) => (
                  <field.SelectField
                    label={t('dukaan.product.trackingType')}
                    required
                    options={[
                      { value: 'SERIALIZED', label: t('dukaan.product.serialized') },
                      { value: 'QUANTITY', label: t('dukaan.product.quantity') }
                    ]}
                  />
                )}
              />
            ) : null}
            <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
              <form.AppField
                name='default_purchase_price'
                children={(field) => (
                  <field.TextField
                    label={t('dukaan.product.purchasePrice')}
                    type='number'
                    required
                  />
                )}
              />
              <form.AppField
                name='default_selling_price'
                children={(field) => (
                  <field.TextField
                    label={t('dukaan.product.sellingPrice')}
                    type='number'
                    required
                  />
                )}
              />
            </div>
            <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
              <form.AppField
                name='model'
                children={(field) => <field.TextField label={t('dukaan.product.model')} />}
              />
              <form.AppField
                name='color'
                children={(field) => <field.TextField label={t('dukaan.product.color')} />}
              />
            </div>
            <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
              <form.AppField
                name='ram'
                children={(field) => <field.TextField label={t('dukaan.product.ram')} />}
              />
              <form.AppField
                name='storage'
                children={(field) => <field.TextField label={t('dukaan.product.storage')} />}
              />
            </div>
            <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
              <form.AppField
                name='sku'
                children={(field) => <field.TextField label={t('dukaan.product.sku')} />}
              />
              <form.AppField
                name='barcode'
                children={(field) => <field.TextField label={t('dukaan.product.barcode')} />}
              />
            </div>
            <form.AppField
              name='low_stock_threshold'
              children={(field) => (
                <field.TextField
                  label={t('dukaan.product.lowStockThreshold')}
                  type='number'
                  required
                />
              )}
            />
            <form.AppField
              name='description'
              children={(field) => <field.TextareaField label={t('dukaan.product.description')} />}
            />
          </FieldGroup>
        </div>
        <DialogFooter className='mx-0 mb-0 shrink-0'>
          <DialogCancelButton onClick={() => onOpenChange(false)} disabled={save.isPending} />
          <DialogPrimaryButton mode={isEdit ? 'edit' : 'add'} loading={save.isPending} />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
