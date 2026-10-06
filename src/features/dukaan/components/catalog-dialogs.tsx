'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { nameOnlySchema, productFormSchema, type ProductFormValues } from '../schemas/forms';
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

function CategoryDialogBody({
  category,
  onOpenChange
}: {
  category?: Category | null;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const isEdit = Boolean(category);

  const save = useMutation({
    mutationFn: async (name: string) => {
      if (category) return dukaan.updateCategory(category.id, { name });
      return dukaan.createCategory(name);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Category updated' : 'Category created');
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { name: category?.name ?? '' },
    validators: { onSubmit: nameOnlySchema },
    onSubmit: ({ value }) => {
      save.mutate(value.name.trim());
    }
  });

  return (
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit category' : 'Add category'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update the category name.' : 'Create a new product category.'}
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
              <field.TextField label='Name' required placeholder='e.g. Mobile Phones' autoFocus />
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

function BrandDialogBody({
  brand,
  onOpenChange
}: {
  brand?: Brand | null;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const isEdit = Boolean(brand);

  const save = useMutation({
    mutationFn: async (name: string) => {
      if (brand) return dukaan.updateBrand(brand.id, { name });
      return dukaan.createBrand(name);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Brand updated' : 'Brand created');
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { name: brand?.name ?? '' },
    validators: { onSubmit: nameOnlySchema },
    onSubmit: ({ value }) => {
      save.mutate(value.name.trim());
    }
  });

  return (
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit brand' : 'Add brand'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update the brand name.' : 'Create a new product brand.'}
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
              <field.TextField label='Name' required placeholder='e.g. Samsung' autoFocus />
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

function ProductDialogBody({
  product,
  onOpenChange
}: {
  product?: Product | null;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const isEdit = Boolean(product);

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
      toast.success(isEdit ? 'Product updated' : 'Product created');
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: product ? productToForm(product) : emptyProductForm(),
    validators: { onSubmit: productFormSchema },
    onSubmit: ({ value }) => {
      save.mutate(value);
    }
  });

  return (
    <DialogContent className='flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl'>
      <DialogHeader className='shrink-0 px-4 pt-4 pr-12'>
        <DialogTitle>{isEdit ? 'Edit product' : 'Add product'}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Update product details. Tracking type cannot change after create.'
            : 'Create a serialized (phones) or quantity (accessories) product.'}
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
              children={(field) => <field.TextField label='Name' required />}
            />
            <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
              <form.Field
                name='category_id'
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <FormEntitySelect
                      name={field.name}
                      label='Category'
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onValueChange={(id) => field.handleChange(id)}
                      isInvalid={isInvalid}
                      errors={field.state.meta.errors}
                      queryKey={dukaanKeys.categories()}
                      fetchPage={(filters) => dukaan.listCategories(filters)}
                      placeholder='Select category'
                      searchPlaceholder='Search categories...'
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
                      label='Brand'
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onValueChange={(id) => field.handleChange(id)}
                      isInvalid={isInvalid}
                      errors={field.state.meta.errors}
                      queryKey={dukaanKeys.brands()}
                      fetchPage={(filters) => dukaan.listBrands(filters)}
                      placeholder='Select brand'
                      searchPlaceholder='Search brands...'
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
                    label='Tracking type'
                    required
                    options={[
                      { value: 'SERIALIZED', label: 'Serialized (phones / IMEI)' },
                      { value: 'QUANTITY', label: 'Quantity (accessories)' }
                    ]}
                  />
                )}
              />
            ) : null}
            <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
              <form.AppField
                name='default_purchase_price'
                children={(field) => (
                  <field.TextField label='Default purchase price (Rs)' type='number' required />
                )}
              />
              <form.AppField
                name='default_selling_price'
                children={(field) => (
                  <field.TextField label='Default selling price (Rs)' type='number' required />
                )}
              />
            </div>
            <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
              <form.AppField name='model' children={(field) => <field.TextField label='Model' />} />
              <form.AppField name='color' children={(field) => <field.TextField label='Color' />} />
            </div>
            <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
              <form.AppField name='ram' children={(field) => <field.TextField label='RAM' />} />
              <form.AppField
                name='storage'
                children={(field) => <field.TextField label='Storage' />}
              />
            </div>
            <div className='grid min-w-0 gap-4 sm:grid-cols-2'>
              <form.AppField name='sku' children={(field) => <field.TextField label='SKU' />} />
              <form.AppField
                name='barcode'
                children={(field) => <field.TextField label='Barcode' />}
              />
            </div>
            <form.AppField
              name='low_stock_threshold'
              children={(field) => (
                <field.TextField label='Low stock threshold' type='number' required />
              )}
            />
            <form.AppField
              name='description'
              children={(field) => <field.TextareaField label='Description' />}
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
