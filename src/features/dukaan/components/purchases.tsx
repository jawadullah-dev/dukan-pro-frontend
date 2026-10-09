'use client';

interface PurchaseLineItem {
  product_id: string;
  quantity: number;
  unit_cost: number;
  imeis_text: string;
  imei2_text: string;
  condition: 'NEW' | 'USED';
  tracking_type?: Product['tracking_type'];
}

interface PurchaseFormValues {
  supplier_id: string;
  supplier_invoice_ref: string;
  is_opening_stock: boolean;
  paid_now: number;
  lines: PurchaseLineItem[];
}

interface PurchaseSaveVariables {
  value: PurchaseFormValues;
  confirm_overdraft?: boolean;
}

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { TablePageBody } from '@/components/layout/table-page-body';
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
import { FieldGroup } from '@/components/ui/field';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { StatusBadge } from '@/components/data-table';
import { useT } from '@/i18n/use-t';
import { useAppForm } from '@/lib/form';
import { dukaan } from '@/lib/dukaan';
import { createClientRequestId, formatPkr, fromPaisa, toPaisa } from '@/lib/dukaan/numbers';
import type { SoftCashWarning } from '@/lib/dukaan/types';
import type { Product } from '@/lib/dukaan/types';
import { dukaanKeys, purchaseQueryOptions } from '../api/queries';
import { createPurchaseFormSchema, createReasonSchema } from '../schemas/forms';
import { DialogCancelButton, DialogPrimaryButton } from './dialog-actions';
import { FormEntitySelect } from './form-entity-select';
import { PurchasesTable } from './tables/commerce-tables';

interface PurchaseCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clearDefaultQuery?: boolean;
}

function PurchaseCreateDialog({
  open,
  onOpenChange,
  clearDefaultQuery
}: PurchaseCreateDialogProps) {
  const router = useRouter();
  const t = useT();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next && clearDefaultQuery) router.replace('/dashboard/purchases');
      }}
    >
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

interface PurchasesHeaderActionProps {
  className?: string;
  onAdd: () => void;
}

export function PurchasesHeaderAction({ className, onAdd }: PurchasesHeaderActionProps) {
  const t = useT();
  return (
    <Button type='button' className={className ?? 'h-8'} onClick={onAdd}>
      <Icons.add className='me-2 h-4 w-4' />
      {t('common.newPurchase')}
    </Button>
  );
}

interface PurchasesListClientProps {
  defaultOpenAdd?: boolean;
}

export function PurchasesListClient({ defaultOpenAdd = false }: PurchasesListClientProps) {
  const t = useT();
  const [open, setOpen] = useState(defaultOpenAdd);

  return (
    <TablePageBody>
      <PurchasesTable
        toolbarAction={<PurchasesHeaderAction className='h-8' onAdd={() => setOpen(true)} />}
      />
      <FloatingActionButton label={t('common.newPurchase')} onClick={() => setOpen(true)} />
      <PurchaseCreateDialog open={open} onOpenChange={setOpen} clearDefaultQuery={defaultOpenAdd} />
    </TablePageBody>
  );
}

function parseImeiList(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

type PurchaseLineDraft = {
  product_id: string;
  quantity: number;
  unit_cost: number;
  imeis_text: string;
  imei2_text: string;
  condition: 'NEW' | 'USED';
  tracking_type?: Product['tracking_type'];
};

const emptyLine = (): PurchaseLineDraft => ({
  product_id: '',
  quantity: 1,
  unit_cost: 0,
  imeis_text: '',
  imei2_text: '',
  condition: 'NEW',
  tracking_type: undefined
});

interface PurchaseCreateFormProps {
  onDone?: () => void;
}

export function PurchaseCreateForm({ onDone }: PurchaseCreateFormProps) {
  const qc = useQueryClient();
  const t = useT();
  const [clientRequestId] = useState(() => createClientRequestId());
  const [warning, setWarning] = useState<SoftCashWarning | null>(null);

  const save = useMutation({
    mutationFn: ({ value, confirm_overdraft }: PurchaseSaveVariables) =>
      dukaan.createPurchase({
        supplier_id: value.supplier_id,
        supplier_invoice_ref: value.supplier_invoice_ref || undefined,
        is_opening_stock: value.is_opening_stock,
        paid_now: value.is_opening_stock ? 0 : toPaisa(value.paid_now),
        confirm_overdraft,
        client_request_id: clientRequestId,
        lines: value.lines.map((l) => {
          const imei1 = parseImeiList(l.imeis_text);
          const imei2 = parseImeiList(l.imei2_text);
          return {
            product_id: l.product_id,
            quantity: l.quantity,
            unit_cost: toPaisa(l.unit_cost),
            condition: l.condition,
            imei1: l.tracking_type === 'SERIALIZED' ? imei1 : undefined,
            imei2: l.tracking_type === 'SERIALIZED' && imei2.length > 0 ? imei2 : undefined
          };
        })
      }),
    onSuccess: (res) => {
      if (res.cash_warning) {
        setWarning(res.cash_warning);
        toast.warning(t('dukaan.actions.cashBelowZeroWarning'));
        return;
      }
      toast.success(t('dukaan.purchase.saved', { purchaseNo: res.purchase?.purchase_no ?? '' }));
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
      window.location.href = `/dashboard/purchases/${res.purchase?.id}`;
    },
    onError: (e: Error) => toast.error(e.message)
  });

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
      save.mutate({ value, confirm_overdraft: false });
    }
  });

  return (
    <form
      className='space-y-4'
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
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
                queryKey={dukaanKeys.suppliers()}
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
                          onValueChange={(id, product) => {
                            subField.handleChange(id);
                            form.setFieldValue(
                              `lines[${idx}].unit_cost`,
                              product ? fromPaisa(product.default_purchase_price) : 0
                            );
                            form.setFieldValue(
                              `lines[${idx}].tracking_type`,
                              product?.tracking_type
                            );
                          }}
                          isInvalid={isInvalid}
                          errors={subField.state.meta.errors}
                          queryKey={dukaanKeys.products()}
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
                                label={t('dukaan.purchase.imei1')}
                                placeholder={'111...\n222...'}
                              />
                            )}
                          />
                          <form.AppField
                            name={`lines[${idx}].imei2_text`}
                            children={(subField) => (
                              <subField.TextareaField
                                label={t('dukaan.purchase.imei2Optional')}
                                placeholder={t('dukaan.purchase.optionalSecondImei')}
                              />
                            )}
                          />
                          <form.AppField
                            name={`lines[${idx}].condition`}
                            children={(subField) => (
                              <subField.SelectField
                                label={t('dukaan.purchase.condition')}
                                options={[
                                  { value: 'NEW', label: t('dukaan.purchase.newCondition') },
                                  { value: 'USED', label: t('dukaan.purchase.usedCondition') }
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
              <div className='flex justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => field.pushValue(emptyLine())}
                >
                  <Icons.add className='me-2 h-4 w-4' />
                  {t('dukaan.purchase.addItem')}
                </Button>
              </div>
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
          {t('dukaan.purchase.cashWarning', {
            current: formatPkr(warning.current_cash),
            amount: formatPkr(warning.amount),
            projected: formatPkr(warning.projected_cash)
          })}
          <div className='mt-2 flex justify-end gap-3'>
            <DialogCancelButton onClick={() => setWarning(null)} disabled={save.isPending} />
            <DialogPrimaryButton
              mode='save'
              type='button'
              loading={save.isPending}
              onClick={() => save.mutate({ value: form.state.values, confirm_overdraft: true })}
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

interface PurchaseDetailClientProps {
  id: string;
}

export function PurchaseDetailClient({ id }: PurchaseDetailClientProps) {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(purchaseQueryOptions(id));
  const t = useT();

  const cancel = useMutation({
    mutationFn: (reason: string) => dukaan.cancelPurchase(id, reason),
    onSuccess: () => {
      toast.success(t('dukaan.purchase.cancelled'));
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { reason: '' },
    validators: { onSubmit: createReasonSchema(t) },
    onSubmit: ({ value }) => {
      cancel.mutate(value.reason.trim());
    }
  });

  return (
    <div className='space-y-4'>
      <div className='grid gap-1'>
        <h3 className='text-xl font-semibold'>{data.purchase_no}</h3>
        <p className='text-muted-foreground text-sm'>
          {data.supplier?.name} · {data.purchase_date} · {t('dukaan.purchase.outstanding')}{' '}
          {formatPkr(data.outstanding)}
        </p>
        <div className='flex flex-wrap gap-2'>
          <StatusBadge status={data.status} />
          {data.is_opening_stock ? (
            <StatusBadge
              status='OPENING'
              label={t('dukaan.purchase.openingStockLabel')}
              tone='neutral'
            />
          ) : null}
        </div>
        {data.supplier_invoice_ref ? (
          <p className='text-muted-foreground text-sm'>
            {t('dukaan.purchase.invoiceRef')}: {data.supplier_invoice_ref}
          </p>
        ) : null}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('dukaan.purchase.productHeader')}</TableHead>
            <TableHead>{t('dukaan.purchase.qtyHeader')}</TableHead>
            <TableHead>{t('dukaan.purchase.unitCostHeader')}</TableHead>
            <TableHead>{t('dukaan.purchase.lineHeader')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.product_id}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{formatPkr(item.unit_cost)}</TableCell>
              <TableCell>{formatPkr(item.total_cost)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data.status === 'ACTIVE' ? (
        <form
          className='grid max-w-lg gap-2 rounded-lg border p-3'
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField
              name='reason'
              children={(field) => (
                <field.TextareaField label={t('dukaan.purchase.cancelWithReason')} required />
              )}
            />
          </FieldGroup>
          <Button type='submit' variant='destructive' isLoading={cancel.isPending}>
            {t('dukaan.purchase.cancelTitle')}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
