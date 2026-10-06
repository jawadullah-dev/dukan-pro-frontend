'use client';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { FloatingActionButton } from '@/components/common/floating-action-button';
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
import { t } from '@/i18n';
import { useAppForm } from '@/lib/form';
import { dukaan } from '@/lib/dukaan';
import {
  createClientRequestId,
  formatLabel,
  formatPkr,
  fromPaisa,
  toPaisa
} from '@/lib/dukaan/numbers';
import type { SoftCashWarning } from '@/lib/dukaan/types';
import type { Product } from '@/lib/dukaan/types';
import { dukaanKeys, purchaseQueryOptions } from '../api/queries';
import { ACTION_LABELS } from '../constants/ui';
import { purchaseFormSchema, reasonSchema } from '../schemas/forms';
import { DialogCancelButton, DialogPrimaryButton } from './dialog-actions';
import { FormEntitySelect } from './form-entity-select';
import { PurchasesTable } from './tables/commerce-tables';

function PurchaseCreateDialog({
  open,
  onOpenChange,
  clearDefaultQuery
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clearDefaultQuery?: boolean;
}) {
  const router = useRouter();

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
          <DialogTitle>New purchase</DialogTitle>
          <DialogDescription>Stock in with IMEI1/IMEI2; opening stock skips cash</DialogDescription>
        </DialogHeader>
        <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]'>
          <PurchaseCreateForm onDone={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PurchasesHeaderAction({
  className,
  onAdd
}: {
  className?: string;
  onAdd: () => void;
}) {
  return (
    <Button type='button' className={className ?? 'h-8'} onClick={onAdd}>
      <Icons.add className='me-2 h-4 w-4' />
      {t('common.newPurchase')}
    </Button>
  );
}

export function PurchasesListClient({ defaultOpenAdd = false }: { defaultOpenAdd?: boolean }) {
  const [open, setOpen] = useState(defaultOpenAdd);

  return (
    <>
      <PurchasesTable
        toolbarAction={<PurchasesHeaderAction className='h-8' onAdd={() => setOpen(true)} />}
      />
      <FloatingActionButton label={t('common.newPurchase')} onClick={() => setOpen(true)} />
      <PurchaseCreateDialog open={open} onOpenChange={setOpen} clearDefaultQuery={defaultOpenAdd} />
    </>
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

export function PurchaseCreateForm({ onDone }: { onDone?: () => void }) {
  const qc = useQueryClient();
  const [clientRequestId] = useState(() => createClientRequestId());
  const [warning, setWarning] = useState<SoftCashWarning | null>(null);

  const save = useMutation({
    mutationFn: ({
      value,
      confirm_overdraft
    }: {
      value: {
        supplier_id: string;
        supplier_invoice_ref: string;
        is_opening_stock: boolean;
        paid_now: number;
        lines: Array<{
          product_id: string;
          quantity: number;
          unit_cost: number;
          imeis_text: string;
          imei2_text: string;
          condition: 'NEW' | 'USED';
          tracking_type?: Product['tracking_type'];
        }>;
      };
      confirm_overdraft?: boolean;
    }) =>
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
        toast.warning('Cash would go below zero — confirm to continue');
        return;
      }
      toast.success(`Purchase ${res.purchase!.purchase_no} saved`);
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
      window.location.href = `/dashboard/purchases/${res.purchase!.id}`;
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
    validators: { onSubmit: purchaseFormSchema },
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
                label='Supplier'
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={(id) => field.handleChange(id)}
                isInvalid={isInvalid}
                errors={field.state.meta.errors}
                queryKey={dukaanKeys.suppliers()}
                fetchPage={(filters) => dukaan.listSuppliers(filters)}
                placeholder='Pick supplier'
                searchPlaceholder='Search suppliers...'
              />
            );
          }}
        />
        <form.AppField
          name='supplier_invoice_ref'
          children={(field) => <field.TextField label='Supplier invoice ref (optional)' />}
        />
        <div className='sm:col-span-2'>
          <form.AppField
            name='is_opening_stock'
            listeners={{
              onChange: ({ value }) => {
                if (value) form.setFieldValue('paid_now', 0);
              }
            }}
            children={(field) => (
              <field.CheckboxField label='Opening stock (no cash / no payable)' />
            )}
          />
        </div>
      </div>

      <div className='space-y-3'>
        <h3 className='font-medium'>Items</h3>
        <form.AppField
          name='lines'
          mode='array'
          children={(field) => (
            <>
              {field.state.value.map((_, idx) => (
                <div
                  key={idx}
                  className='relative grid gap-3 rounded-lg border p-3 pr-24 md:grid-cols-[minmax(0,1fr)_5.5rem_8.5rem]'
                >
                  {field.state.value.length > 1 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-2 top-2 h-7 text-muted-foreground hover:text-destructive'
                      onClick={() => field.removeValue(idx)}
                    >
                      <Icons.trash className='mr-1 h-4 w-4' />
                      {ACTION_LABELS.remove}
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
                          label='Product'
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
                          placeholder='Product'
                          searchPlaceholder='Search products...'
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name={`lines[${idx}].quantity`}
                    children={(subField) => (
                      <subField.TextField label='Qty' type='number' required />
                    )}
                  />
                  <form.AppField
                    name={`lines[${idx}].unit_cost`}
                    children={(subField) => (
                      <subField.TextField label='Unit cost (Rs)' type='number' required />
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
                                label='IMEI1 (one per line, count = qty)'
                                placeholder={'111...\n222...'}
                              />
                            )}
                          />
                          <form.AppField
                            name={`lines[${idx}].imei2_text`}
                            children={(subField) => (
                              <subField.TextareaField
                                label='IMEI2 (optional, same count)'
                                placeholder='optional second IMEI…'
                              />
                            )}
                          />
                          <form.AppField
                            name={`lines[${idx}].condition`}
                            children={(subField) => (
                              <subField.SelectField
                                label='Condition'
                                options={[
                                  { value: 'NEW', label: formatLabel('NEW') },
                                  { value: 'USED', label: formatLabel('USED') }
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
                  <Icons.add className='mr-2 h-4 w-4' />
                  Add item
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
                    <subField.TextField label='Paid now (Rs)' type='number' required />
                  )}
                />
              </div>
              <p className='pb-2 text-right text-sm font-medium tabular-nums'>
                Total: {formatPkr(toPaisa(totalRs))}
              </p>
            </div>
          ) : (
            <p className='text-right text-sm font-medium tabular-nums text-muted-foreground'>
              Opening stock total: {formatPkr(toPaisa(totalRs))}
              <span className='font-normal'> (no cash movement)</span>
            </p>
          );
        }}
      />

      {warning ? (
        <div className='rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm'>
          Cash is {formatPkr(warning.current_cash)}. Paying {formatPkr(warning.amount)} would leave{' '}
          {formatPkr(warning.projected_cash)}. Confirm soft overdraft?
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

export function PurchaseDetailClient({ id }: { id: string }) {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(purchaseQueryOptions(id));

  const cancel = useMutation({
    mutationFn: (reason: string) => dukaan.cancelPurchase(id, reason),
    onSuccess: () => {
      toast.success('Purchase cancelled');
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { reason: '' },
    validators: { onSubmit: reasonSchema },
    onSubmit: ({ value }) => {
      cancel.mutate(value.reason.trim());
    }
  });

  return (
    <div className='space-y-4'>
      <div className='grid gap-1'>
        <h3 className='text-xl font-semibold'>{data.purchase_no}</h3>
        <p className='text-muted-foreground text-sm'>
          {data.supplier?.name} · {data.purchase_date} · Outstanding {formatPkr(data.outstanding)}
        </p>
        <div className='flex flex-wrap gap-2'>
          <StatusBadge status={data.status} />
          {data.is_opening_stock ? (
            <StatusBadge status='OPENING' label='Opening stock' tone='neutral' />
          ) : null}
        </div>
        {data.supplier_invoice_ref ? (
          <p className='text-muted-foreground text-sm'>Invoice ref: {data.supplier_invoice_ref}</p>
        ) : null}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Unit cost</TableHead>
            <TableHead>Line</TableHead>
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
              children={(field) => <field.TextareaField label='Cancel with reason' required />}
            />
          </FieldGroup>
          <Button type='submit' variant='destructive' isLoading={cancel.isPending}>
            Cancel purchase
          </Button>
        </form>
      ) : null}
    </div>
  );
}
