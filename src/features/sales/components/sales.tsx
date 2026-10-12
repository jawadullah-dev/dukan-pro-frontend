'use client';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { useT } from '@/i18n/use-t';
import { useAppForm } from '@/lib/form';
import { dukaan } from '@/lib/dukaan';
import {
  createClientRequestId,
  formatLabel,
  formatPkr,
  fromPaisa,
  toPaisa
} from '@/lib/dukaan/numbers';
import type { Product } from '@/lib/dukaan/types';
import { listCustomers } from '@/features/customers/api/service';
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';
import { FormEntitySelect } from '@/components/forms/form-entity-select';
import { SalesTable } from './sales-table';
import { CancelSaleDialog } from './cancel-sale-dialog';
import { ReturnSaleDialog } from './return-sale-dialog';
import { saleKeys, saleQueryOptions } from '../api/queries';
import { createSaleMutation } from '../api/mutations';
import type { CreateSaleInput, CreateSaleItemInput, SaleDTO } from '@/lib/api/types';

// ---------------------------------------------------------------------------
// Dialog wrapper for creating a sale
// ---------------------------------------------------------------------------

interface SaleCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clearDefaultQuery?: boolean;
}

export function SaleCreateDialog({ open, onOpenChange, clearDefaultQuery }: SaleCreateDialogProps) {
  const router = useRouter();
  const t = useT();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next && clearDefaultQuery) router.replace('/dashboard/sales');
      }}
    >
      <DialogContent className='flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl'>
        <DialogHeader className='shrink-0 px-4 pt-4 pe-12'>
          <DialogTitle>{t('dukaan.sale.newTitle') || 'New Sale'}</DialogTitle>
          <DialogDescription>
            {t('dukaan.sale.newDescription') || 'Record a new sale for cash or Udhar.'}
          </DialogDescription>
        </DialogHeader>
        <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4'>
          <Suspense
            fallback={
              <p className='text-muted-foreground text-sm'>
                {t('dukaan.sale.loading') || 'Loading...'}
              </p>
            }
          >
            <SaleCreateForm onDone={() => onOpenChange(false)} />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Header Action
// ---------------------------------------------------------------------------

interface SalesHeaderActionProps {
  className?: string;
  onAdd: () => void;
}

export function SalesHeaderAction({ className, onAdd }: SalesHeaderActionProps) {
  const t = useT();
  return (
    <Button type='button' className={className ?? 'h-8'} onClick={onAdd}>
      <Icons.add className='me-2 h-4 w-4' />
      {t('common.newSale') || 'New Sale'}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// SalesListClient
// ---------------------------------------------------------------------------

interface SalesListClientProps {
  defaultOpenAdd?: boolean;
}

export function SalesListClient({ defaultOpenAdd = false }: SalesListClientProps) {
  const t = useT();
  const [open, setOpen] = useState(defaultOpenAdd);

  return (
    <TablePageBody>
      <SalesTable
        toolbarAction={<SalesHeaderAction className='h-8' onAdd={() => setOpen(true)} />}
      />
      <FloatingActionButton
        label={t('common.newSale') || 'New Sale'}
        onClick={() => setOpen(true)}
      />
      <SaleCreateDialog open={open} onOpenChange={setOpen} clearDefaultQuery={defaultOpenAdd} />
    </TablePageBody>
  );
}

// ---------------------------------------------------------------------------
// Create Form
// ---------------------------------------------------------------------------

interface SaleLineItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  inventory_unit_id?: string;
  tracking_type?: Product['tracking_type'];
}

interface SaleFormValues {
  customer_id: string;
  discount: number;
  paid_now: number;
  lines: SaleLineItem[];
  notes?: string;
}

const emptySaleLine: SaleLineItem = {
  product_id: '',
  quantity: 1,
  unit_price: 0,
  inventory_unit_id: ''
};

interface SaleCreateFormProps {
  onDone?: () => void;
}

export function SaleCreateForm({ onDone }: SaleCreateFormProps) {
  const qc = useQueryClient();
  const router = useRouter();
  const t = useT();
  const [clientRequestId] = useState(() => createClientRequestId());
  const today = new Date().toISOString().split('T')[0];

  const save = useMutation({
    ...createSaleMutation,
    onSuccess: (res: SaleDTO) => {
      toast.success(t('dukaan.sale.saved', { saleNo: res.saleNo }) || `Sale ${res.saleNo} created`);
      void qc.invalidateQueries({ queryKey: saleKeys.all });
      onDone?.();
      router.push(`/dashboard/sales/${res.id}`);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: {
      customer_id: '__walkin__',
      discount: 0,
      paid_now: 0,
      notes: '',
      lines: [{ ...emptySaleLine }]
    },
    onSubmit: ({ value }: { value: SaleFormValues }) => {
      const items: CreateSaleItemInput[] = value.lines
        .filter((l) => l.product_id)
        .map((l) => ({
          productId: l.product_id,
          quantity: Number(l.quantity) || 1,
          unitPrice: toPaisa(Number(l.unit_price) || 0),
          inventoryUnitId: l.inventory_unit_id || undefined
        }));

      if (items.length === 0) {
        toast.error('Please add at least one product line');
        return;
      }

      const payload: CreateSaleInput = {
        clientRequestId,
        saleDate: today,
        customerId: value.customer_id === '__walkin__' ? undefined : value.customer_id,
        items,
        discount: toPaisa(Number(value.discount) || 0),
        paidNow: toPaisa(Number(value.paid_now) || 0),
        notes: value.notes?.trim() || undefined
      };

      save.mutate(payload);
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
      <FieldGroup className='max-w-md gap-3'>
        <form.Subscribe
          selector={(s) => s.values.lines}
          children={(lines) => {
            const hasPhone = lines.some((l) => l.tracking_type === 'SERIALIZED');
            return (
              <form.Field
                name='customer_id'
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <FormEntitySelect
                      name={field.name}
                      label={
                        hasPhone
                          ? t('dukaan.sale.customerRequiredPhones') ||
                            'Customer (Required for phones)'
                          : t('dukaan.sale.customerRequiredUdhar') || 'Customer'
                      }
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onValueChange={(id) => field.handleChange(id || '__walkin__')}
                      isInvalid={isInvalid}
                      errors={field.state.meta.errors}
                      queryKey={['customers', 'picker']}
                      fetchPage={(filters) =>
                        listCustomers(filters).then((res) => ({
                          items: res.items,
                          total: res.total,
                          page: res.page,
                          limit: res.pageSize
                        }))
                      }
                      placeholder={
                        t('dukaan.sale.walkInOrCustomer') || 'Walk-in or select customer'
                      }
                      searchPlaceholder={t('dukaan.sale.searchCustomers') || 'Search customers...'}
                      selectedLabel={
                        field.state.value === '__walkin__'
                          ? t('dukaan.sale.walkIn') || 'Walk-in Customer'
                          : undefined
                      }
                      extraItems={[
                        {
                          id: '__walkin__',
                          name: t('dukaan.sale.walkInCashOnly') || 'Walk-in (Cash only)'
                        }
                      ]}
                    />
                  );
                }}
              />
            );
          }}
        />
      </FieldGroup>

      <div className='space-y-3'>
        <form.AppField
          name='lines'
          mode='array'
          children={(field) => (
            <>
              {field.state.value.map((_, idx) => (
                <div
                  key={idx}
                  className='relative grid gap-2 rounded-lg border p-3 pe-24 md:grid-cols-4'
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
                      {t('common.remove') || 'Remove'}
                    </Button>
                  )}
                  <div className='md:col-span-2'>
                    <form.Field
                      name={`lines[${idx}].product_id`}
                      children={(subField) => {
                        const isInvalid =
                          subField.state.meta.isTouched && !subField.state.meta.isValid;
                        return (
                          <FormEntitySelect<Product>
                            name={subField.name}
                            label={t('dukaan.sale.product') || 'Product'}
                            required
                            value={subField.state.value}
                            onBlur={subField.handleBlur}
                            onValueChange={(id, product) => {
                              subField.handleChange(id);
                              form.setFieldValue(
                                `lines[${idx}].unit_price`,
                                product ? fromPaisa(product.default_selling_price) : 0
                              );
                              form.setFieldValue(
                                `lines[${idx}].tracking_type`,
                                product?.tracking_type
                              );
                              form.setFieldValue(`lines[${idx}].inventory_unit_id`, '');
                              form.setFieldValue(`lines[${idx}].quantity`, 1);
                            }}
                            isInvalid={isInvalid}
                            errors={subField.state.meta.errors}
                            queryKey={['products', 'picker']}
                            fetchPage={(filters) => dukaan.listProducts(filters)}
                            placeholder={t('dukaan.sale.product') || 'Select product'}
                            searchPlaceholder={
                              t('dukaan.sale.searchProducts') || 'Search products...'
                            }
                          />
                        );
                      }}
                    />
                  </div>
                  <form.AppField
                    name={`lines[${idx}].quantity`}
                    children={(subField) => (
                      <subField.TextField
                        label={t('dukaan.sale.quantity') || 'Quantity'}
                        type='number'
                        required
                      />
                    )}
                  />
                  <form.AppField
                    name={`lines[${idx}].unit_price`}
                    children={(subField) => (
                      <subField.TextField
                        label={t('dukaan.sale.unitPrice') || 'Unit Price (PKR)'}
                        type='number'
                        required
                      />
                    )}
                  />
                </div>
              ))}
              <div className='flex justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => field.pushValue({ ...emptySaleLine })}
                >
                  <Icons.add className='me-2 h-4 w-4' />
                  {t('dukaan.sale.addItem') || 'Add Line Item'}
                </Button>
              </div>
            </>
          )}
        />
      </div>

      <div className='grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2'>
        <form.AppField
          name='discount'
          children={(field) => (
            <field.TextField
              label={t('dukaan.sale.discount') || 'Discount (PKR)'}
              type='number'
              required
            />
          )}
        />
        <form.AppField
          name='paid_now'
          children={(field) => (
            <field.TextField
              label={t('dukaan.sale.paidNow') || 'Paid Now (PKR)'}
              type='number'
              required
            />
          )}
        />
        <div className='sm:col-span-2'>
          <form.AppField
            name='notes'
            children={(field) => (
              <field.TextField label='Notes (Optional)' placeholder='Additional notes...' />
            )}
          />
        </div>
        <form.Subscribe
          selector={(s) => ({
            lines: s.values.lines,
            discount: s.values.discount,
            paidNow: s.values.paid_now
          })}
          children={({ lines, discount, paidNow }) => {
            const subtotalRs = lines.reduce(
              (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0),
              0
            );
            const totalRs = Math.max(0, subtotalRs - (Number(discount) || 0));
            const udharRs = Math.max(0, totalRs - (Number(paidNow) || 0));
            return (
              <p className='flex items-center text-muted-foreground text-sm sm:col-span-2'>
                Subtotal: {formatPkr(toPaisa(subtotalRs))} · Total: {formatPkr(toPaisa(totalRs))}
                {udharRs > 0 && ` · Udhar: ${formatPkr(toPaisa(udharRs))}`}
              </p>
            );
          }}
        />
      </div>

      <DialogFooter className='mx-0 mb-0 px-0 gap-2 sm:gap-2.5'>
        {onDone ? <DialogCancelButton onClick={onDone} disabled={save.isPending} /> : null}
        <DialogPrimaryButton mode='save' loading={save.isPending} />
      </DialogFooter>
    </form>
  );
}

// ---------------------------------------------------------------------------
// SaleDetailClient
// ---------------------------------------------------------------------------

interface SaleDetailClientProps {
  id: string;
}

export function SaleDetailClient({ id }: SaleDetailClientProps) {
  const { data } = useSuspenseQuery(saleQueryOptions(id));
  const t = useT();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  const activePayments = (data.payments ?? []).filter((p) => p.status === 'ACTIVE');
  const totalPaid = activePayments.reduce((acc, p) => acc + p.amount, 0);
  const outstanding = data.totalAmount - totalPaid;
  const isCancelled = data.status === 'CANCELLED';
  const hasReturns = (data.returns?.length ?? 0) > 0;

  return (
    <div className='space-y-6'>
      {cancelOpen && (
        <CancelSaleDialog sale={data} open={cancelOpen} onOpenChange={setCancelOpen} />
      )}
      {returnOpen && (
        <ReturnSaleDialog sale={data} open={returnOpen} onOpenChange={setReturnOpen} />
      )}

      {/* Header */}
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2'>
            <h3 className='text-2xl font-bold tracking-tight'>{data.saleNo}</h3>
            <Badge variant={isCancelled ? 'destructive' : 'default'}>{data.status}</Badge>
            {hasReturns && (
              <Badge
                variant='outline'
                className='border-amber-500/40 text-amber-600 dark:text-amber-400'
              >
                Items Returned
              </Badge>
            )}
          </div>
          <p className='mt-1 text-muted-foreground text-sm'>
            {data.customerName ?? 'Walk-in Customer'} ·{' '}
            {data.saleDate ? data.saleDate.split('T')[0] : '—'}
            {outstanding > 0 && !isCancelled && (
              <span className='font-medium text-amber-600 dark:text-amber-400'>
                {' '}
                · Udhar: {formatPkr(outstanding)}
              </span>
            )}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Link
            href={`/dashboard/sales/${id}/receipt`}
            className='border-border inline-flex h-8 items-center rounded-lg border px-3 text-sm font-medium hover:bg-muted'
          >
            <Icons.page className='me-1.5 h-4 w-4' />
            Print Receipt
          </Link>

          {!isCancelled && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8'
              onClick={() => setReturnOpen(true)}
            >
              <Icons.history className='me-1.5 h-3.5 w-3.5 text-blue-500' />
              Record Return
            </Button>
          )}

          {!isCancelled && !hasReturns && (
            <Button
              type='button'
              variant='destructive'
              size='sm'
              className='h-8'
              onClick={() => setCancelOpen(true)}
            >
              <Icons.trash className='me-1.5 h-3.5 w-3.5' />
              Cancel Sale
            </Button>
          )}
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className='rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
          <p className='font-semibold'>This sale has been cancelled.</p>
          {data.cancelReason && <p className='mt-1'>Reason: {data.cancelReason}</p>}
          {data.cancelledAt && (
            <p className='text-xs text-muted-foreground mt-0.5'>
              Cancelled on: {data.cancelledAt.split('T')[0]}
            </p>
          )}
        </div>
      )}

      {/* Items Table */}
      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>IMEI</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className='text-end'>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data.items ?? []).map((item) => (
              <TableRow key={item.id}>
                <TableCell className='font-medium'>{item.productName}</TableCell>
                <TableCell>{item.imei ?? '—'}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatPkr(item.unitPrice)}</TableCell>
                <TableCell className='text-end font-semibold'>{formatPkr(item.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Payments and Returns cards */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* Payments */}
        <div className='rounded-lg border p-4 space-y-3'>
          <h4 className='font-semibold text-sm'>Payments Recorded</h4>
          {(data.payments ?? []).length === 0 ? (
            <p className='text-muted-foreground text-xs italic'>
              No payments recorded (Full Udhar).
            </p>
          ) : (
            <div className='space-y-2'>
              {data.payments.map((p) => (
                <div
                  key={p.id}
                  className='flex items-center justify-between text-xs border-b pb-1.5 last:border-0'
                >
                  <div>
                    <span className='font-medium'>{formatPkr(p.amount)}</span> ·{' '}
                    {formatLabel(p.method)}
                    {p.status === 'CANCELLED' && (
                      <span className='ms-1 text-destructive'>(Cancelled)</span>
                    )}
                  </div>
                  <span className='text-muted-foreground font-mono text-[11px]'>
                    {p.createdAt ? p.createdAt.split('T')[0] : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial Summary */}
        <div className='rounded-lg border p-4 space-y-2 text-sm'>
          <h4 className='font-semibold'>Sale Summary</h4>
          <div className='flex justify-between text-muted-foreground'>
            <span>Subtotal</span>
            <span>{formatPkr(data.subtotal)}</span>
          </div>
          <div className='flex justify-between text-muted-foreground'>
            <span>Discount</span>
            <span>-{formatPkr(data.discount)}</span>
          </div>
          <div className='flex justify-between font-semibold border-t pt-2'>
            <span>Total Amount</span>
            <span>{formatPkr(data.totalAmount)}</span>
          </div>
          <div className='flex justify-between text-emerald-600 dark:text-emerald-400'>
            <span>Paid</span>
            <span>{formatPkr(totalPaid)}</span>
          </div>
          {outstanding > 0 && !isCancelled && (
            <div className='flex justify-between font-medium text-amber-600 dark:text-amber-400'>
              <span>Outstanding Udhar</span>
              <span>{formatPkr(outstanding)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Returns History */}
      {(data.returns ?? []).length > 0 && (
        <div className='rounded-lg border p-4 space-y-3'>
          <h4 className='font-semibold text-sm'>Returns History</h4>
          <div className='space-y-2'>
            {data.returns.map((ret) => (
              <div key={ret.id} className='rounded-md border bg-muted/30 p-3 text-xs space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <span className='font-semibold'>{ret.reason}</span>
                  <span className='font-medium text-destructive'>
                    -{formatPkr(ret.returnAmount)}
                  </span>
                </div>
                <p className='text-muted-foreground'>
                  Date: {ret.returnDate ? ret.returnDate.split('T')[0] : '—'}
                  {ret.notes ? ` · Notes: ${ret.notes}` : ''}
                </p>
                {ret.items && ret.items.length > 0 && (
                  <div className='pt-1'>
                    <span className='text-muted-foreground'>Returned: </span>
                    {ret.items.map((ri, i) => (
                      <span key={i} className='font-medium'>
                        {ri.productName} (x{ri.quantity}, {ri.condition})
                        {i < ret.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SaleReceiptClient
// ---------------------------------------------------------------------------

interface SaleReceiptClientProps {
  id: string;
}

export function SaleReceiptClient({ id }: SaleReceiptClientProps) {
  const t = useT();
  const { data } = useSuspenseQuery(saleQueryOptions(id));
  const activePayments = (data.payments ?? []).filter((p) => p.status === 'ACTIVE');
  const paid = activePayments.reduce((acc, p) => acc + p.amount, 0);
  const outstanding = Math.max(0, data.totalAmount - paid);

  return (
    <div className='mx-auto max-w-lg space-y-4 rounded-lg border bg-white p-6 text-black print:border-0'>
      <div className='text-center'>
        <h1 className='text-xl font-bold'>Dukan Pro</h1>
        <p className='mt-2 font-medium'>Receipt {data.saleNo}</p>
        <p className='text-sm'>{data.saleDate ? data.saleDate.split('T')[0] : '—'}</p>
      </div>
      <div className='text-sm'>Customer: {data.customerName ?? 'Walk-in Customer'}</div>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b text-start'>
            <th className='py-1'>Item</th>
            <th>IMEI</th>
            <th>Qty</th>
            <th className='text-end'>Amount</th>
          </tr>
        </thead>
        <tbody>
          {(data.items ?? []).map((item) => (
            <tr key={item.id} className='border-b'>
              <td className='py-1'>{item.productName}</td>
              <td>{item.imei ?? '—'}</td>
              <td>{item.quantity}</td>
              <td className='text-end'>{formatPkr(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='space-y-1 text-sm'>
        <div className='flex justify-between'>
          <span>Subtotal</span>
          <span>{formatPkr(data.subtotal)}</span>
        </div>
        <div className='flex justify-between'>
          <span>Discount</span>
          <span>{formatPkr(data.discount)}</span>
        </div>
        <div className='flex justify-between font-semibold'>
          <span>Total</span>
          <span>{formatPkr(data.totalAmount)}</span>
        </div>
        <div className='flex justify-between'>
          <span>Paid</span>
          <span>{formatPkr(paid)}</span>
        </div>
        <div className='flex justify-between'>
          <span>Balance</span>
          <span>{formatPkr(outstanding)}</span>
        </div>
      </div>
      <Button className='print:hidden w-full' onClick={() => window.print()}>
        Print Receipt
      </Button>
    </div>
  );
}
