'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useT } from '@/i18n/use-t';
import { useAppForm } from '@/lib/form';
import { dukaan } from '@/lib/dukaan';
import { todayIsoDate } from '@/lib/dates';
import { createClientRequestId, formatPkr, fromPaisa, toPaisa } from '@/lib/dukaan/numbers';
import type { Product } from '@/lib/dukaan/types';
import type {
  CreatePurchaseInput,
  CreatePurchaseItemInput,
  CreatePurchaseResult
} from '@/lib/api/types';
import type {
  PurchaseLineItem,
  PurchaseFormValues,
  PurchaseLineDraft,
  PurchaseCreateFormProps,
  PurchaseCreateDialogProps
} from '@/types/purchases';
import type { OverdraftPrompt } from '@/types';
import { purchaseKeys } from '../api/queries';
import { createPurchaseMutation } from '../api/mutations';
import { createPurchaseFormSchema } from '../schemas/purchase-schema';
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';
import { FormEntitySelect } from '@/components/forms/form-entity-select';
import type { SubFieldApi } from '@/types/forms';

function parseImeiList(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

const emptyLine = (): PurchaseLineDraft => ({
  product_id: '',
  quantity: 1,
  unit_cost: 0,
  imeis_text: '',
  imei2_text: '',
  condition: 'NEW',
  tracking_type: undefined
});

export function PurchaseCreateForm({ onDone }: PurchaseCreateFormProps) {
  const qc = useQueryClient();
  const router = useRouter();
  const t = useT();
  const [clientRequestId] = useState(() => createClientRequestId());
  const [warning, setWarning] = useState<OverdraftPrompt | null>(null);

  const save = useMutation({
    ...createPurchaseMutation,
    onSuccess: (res: CreatePurchaseResult) => {
      if (res && 'confirmOverdraft' in res && res.confirmOverdraft) {
        setWarning({
          shortfall: res.shortfall,
          message: res.message
        });
        toast.warning(res.message || t('dukaan.actions.cashBelowZeroWarning'));
        return;
      }
      toast.success(
        res?.message || t('dukaan.purchase.saved', { purchaseNo: res?.purchase?.purchaseNo ?? '' })
      );
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      onDone?.();
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const submitPurchase = (values: PurchaseFormValues, confirmOverdraft = false) => {
    const today = todayIsoDate();
    const items: CreatePurchaseItemInput[] = values.lines
      .filter((l) => l.product_id)
      .map((l) => {
        const imeis = parseImeiList(l.imeis_text);
        return {
          productId: l.product_id,
          quantity: Number(l.quantity) || 1,
          unitCost: toPaisa(Number(l.unit_cost) || 0),
          condition: l.condition,
          imeis: l.tracking_type === 'SERIALIZED' && imeis.length > 0 ? imeis : undefined
        };
      });

    if (items.length === 0) {
      toast.error(t('purchases.addAtLeastOneItem'));
      return;
    }

    const payload: CreatePurchaseInput = {
      clientRequestId,
      supplierId: values.supplier_id,
      supplierInvoiceRef: values.supplier_invoice_ref?.trim() || undefined,
      purchaseDate: today,
      isOpeningStock: values.is_opening_stock,
      paidNow: values.is_opening_stock ? 0 : toPaisa(Number(values.paid_now) || 0),
      confirmOverdraft,
      items
    };

    save.mutate(payload);
  };

  const form = useAppForm({
    defaultValues: {
      supplier_id: '',
      supplier_invoice_ref: '',
      is_opening_stock: false,
      paid_now: 0,
      lines: [emptyLine()]
    },
    validators: { onSubmit: createPurchaseFormSchema(t) },
    onSubmit: ({ value }) => {
      setWarning(null);
      submitPurchase(value, false);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  const handleProductSelect = (
    idx: number,
    subField: SubFieldApi,
    id: string,
    product: Product | null
  ) => {
    subField.handleChange(id);
    form.setFieldValue(
      `lines[${idx}].unit_cost`,
      product ? fromPaisa(product.default_purchase_price) : 0
    );
    form.setFieldValue(`lines[${idx}].tracking_type`, product?.tracking_type);
  };

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <form.Field
          name='supplier_id'
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <FormEntitySelect
                name={field.name}
                label={t('dukaan.purchase.supplier')}
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={(id) => field.handleChange(id)}
                isInvalid={isInvalid}
                errors={field.state.meta.errors}
                queryKey={['suppliers', 'picker']}
                fetchPage={(filters) => dukaan.listSuppliers(filters)}
                placeholder={t('dukaan.purchase.pickSupplier')}
                searchPlaceholder={t('dukaan.purchase.searchSuppliers')}
              />
            );
          }}
        />
        <form.AppField
          name='supplier_invoice_ref'
          children={(field) => <field.TextField label={t('dukaan.purchase.invoiceRef')} />}
        />
        <div className='sm:col-span-2'>
          <form.AppField
            name='is_opening_stock'
            listeners={{
              onChange: ({ value }) => {
                if (value) form.setFieldValue('paid_now', 0);
              }
            }}
            children={(field) => <field.CheckboxField label={t('dukaan.purchase.openingStock')} />}
          />
        </div>
      </div>

      <div className='space-y-3'>
        <h3 className='font-medium'>{t('dukaan.purchase.items')}</h3>
        <form.AppField
          name='lines'
          mode='array'
          children={(field) => (
            <>
              {field.state.value.map((_, idx) => (
                <div
                  key={idx}
                  className='relative grid gap-3 rounded-lg border p-3 pe-24 md:grid-cols-[minmax(0,1fr)_5.5rem_8.5rem]'
                >
                  {field.state.value.length > 1 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute end-2 top-2 h-7 text-muted-foreground hover:text-destructive'
                      onClick={() => field.removeValue(idx)}
                    >
                      <Icons.trash className='me-1 h-4 w-4' />
                      {t('common.remove')}
                    </Button>
                  )}
                  <form.Field
                    name={`lines[${idx}].product_id`}
                    children={(subField) => {
                      const isInvalid =
                        subField.state.meta.isTouched && !subField.state.meta.isValid;
                      return (
                        <FormEntitySelect<Product>
                          name={subField.name}
                          label={t('dukaan.purchase.product')}
                          required
                          value={subField.state.value}
                          onBlur={subField.handleBlur}
                          onValueChange={(id, product) =>
                            handleProductSelect(idx, subField, id, product)
                          }
                          isInvalid={isInvalid}
                          errors={subField.state.meta.errors}
                          queryKey={['products', 'picker']}
                          fetchPage={(filters) => dukaan.listProducts(filters)}
                          placeholder={t('dukaan.purchase.product')}
                          searchPlaceholder={t('dukaan.purchase.searchProducts')}
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name={`lines[${idx}].quantity`}
                    children={(subField) => (
                      <subField.TextField
                        label={t('dukaan.purchase.quantity')}
                        type='number'
                        required
                      />
                    )}
                  />
                  <form.AppField
                    name={`lines[${idx}].unit_cost`}
                    children={(subField) => (
                      <subField.TextField
                        label={t('dukaan.purchase.unitCost')}
                        type='number'
                        required
                      />
                    )}
                  />
                  <form.Subscribe
                    selector={(s) => s.values.lines[idx]?.tracking_type}
                    children={(trackingType) =>
                      trackingType === 'SERIALIZED' ? (
                        <div className='col-span-full grid gap-2 md:grid-cols-2'>
                          <form.AppField
                            name={`lines[${idx}].imeis_text`}
                            children={(subField) => (
                              <subField.TextareaField
                                label={t('dukaan.purchase.imei1List')}
                                placeholder={t('dukaan.purchase.imeiHelp')}
                                rows={2}
                                required
                              />
                            )}
                          />
                          <form.AppField
                            name={`lines[${idx}].condition`}
                            children={(subField) => (
                              <subField.SelectField
                                label={t('dukaan.purchase.condition')}
                                options={[
                                  {
                                    label: t('dukaan.purchase.conditionNew'),
                                    value: 'NEW'
                                  },
                                  {
                                    label: t('dukaan.purchase.conditionUsed'),
                                    value: 'USED'
                                  }
                                ]}
                              />
                            )}
                          />
                        </div>
                      ) : null
                    }
                  />
                </div>
              ))}
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => field.pushValue(emptyLine())}
              >
                <Icons.add className='me-1 h-4 w-4' />
                {t('dukaan.purchase.addLine')}
              </Button>
            </>
          )}
        />
      </div>

      <form.Subscribe
        selector={(s) => ({
          isOpeningStock: s.values.is_opening_stock,
          lines: s.values.lines
        })}
        children={({ isOpeningStock, lines }) => {
          const totalRs = lines.reduce(
            (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_cost) || 0),
            0
          );
          return !isOpeningStock ? (
            <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
              <div className='w-full sm:max-w-xs'>
                <form.AppField
                  name='paid_now'
                  children={(subField) => (
                    <subField.TextField
                      label={t('dukaan.purchase.paidNow')}
                      type='number'
                      required
                    />
                  )}
                />
              </div>
              <p className='pb-2 text-end text-sm font-medium tabular-nums'>
                {t('dukaan.purchase.total', { total: formatPkr(toPaisa(totalRs)) })}
              </p>
            </div>
          ) : (
            <p className='text-end text-sm font-medium tabular-nums text-muted-foreground'>
              {t('dukaan.purchase.openingStockTotal', { total: formatPkr(toPaisa(totalRs)) })}
              <span className='font-normal'> {t('dukaan.purchase.noCashMovement')}</span>
            </p>
          );
        }}
      />

      {warning ? (
        <div className='rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm'>
          <p className='font-medium text-amber-900 dark:text-amber-200'>
            {warning.message || t('purchases.overdraftWarning')}
          </p>
          {warning.shortfall ? (
            <p className='text-xs text-muted-foreground mt-1'>
              {t('purchases.shortfall')} {formatPkr(warning.shortfall)}
            </p>
          ) : null}
          <div className='mt-2 flex justify-end gap-3'>
            <DialogCancelButton onClick={() => setWarning(null)} disabled={save.isPending} />
            <DialogPrimaryButton
              mode='save'
              type='button'
              loading={save.isPending}
              onClick={() => submitPurchase(form.state.values, true)}
            />
          </div>
        </div>
      ) : (
        <DialogFooter className='mx-0 mb-0 px-0'>
          {onDone ? <DialogCancelButton onClick={onDone} disabled={save.isPending} /> : null}
          <DialogPrimaryButton mode='save' loading={save.isPending} />
        </DialogFooter>
      )}
    </form>
  );
}

export function PurchaseCreateDialog({
  open,
  onOpenChange,
  clearDefaultQuery
}: PurchaseCreateDialogProps) {
  const router = useRouter();
  const t = useT();

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next && clearDefaultQuery) router.replace('/dashboard/purchases');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='flex max-h-[90dvh] w-full flex-col gap-0 overflow-hidden p-0 data-[size]:max-w-none sm:max-w-3xl max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[90dvh] max-sm:translate-y-0 max-sm:rounded-t-[var(--radius)] max-sm:rounded-b-none'>
        <DialogHeader className='shrink-0 px-4 pt-4 pe-12'>
          <DialogTitle>{t('dukaan.purchase.newTitle')}</DialogTitle>
          <DialogDescription>{t('dukaan.purchase.newDescription')}</DialogDescription>
        </DialogHeader>
        <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]'>
          <PurchaseCreateForm onDone={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
