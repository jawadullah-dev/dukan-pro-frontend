'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { useT } from '@/i18n/use-t';
import { formatPkr, toPaisa } from '@/lib/dukaan/numbers';
import type { ReturnPreviewDTO, ReturnItemInput } from '@/lib/api/types';
import type { ReturnSaleDialogProps, ItemReturnState } from '@/types/sales';
import { saleKeys } from '../api/queries';
import { createReturnMutation, previewReturnMutation } from '../api/mutations';

export function ReturnSaleDialog({ sale, open, onOpenChange, onSuccess }: ReturnSaleDialogProps) {
  const qc = useQueryClient();
  const t = useT();
  const today = new Date().toISOString().split('T')[0];

  const [returnDate, setReturnDate] = useState(today);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [refundPkr, setRefundPkr] = useState<number>(0);
  const [confirmOverdraft, setConfirmOverdraft] = useState(false);
  const [previewData, setPreviewData] = useState<ReturnPreviewDTO | null>(null);

  const [itemStates, setItemStates] = useState<Record<string, ItemReturnState>>(() => {
    const initial: Record<string, ItemReturnState> = {};
    for (const item of sale.items) {
      initial[item.id] = {
        selected: false,
        quantity: item.quantity,
        condition: 'GOOD'
      };
    }
    return initial;
  });

  const preview = useMutation({
    ...previewReturnMutation,
    onSuccess: (data) => {
      setPreviewData(data);
    },
    onError: (err: Error) => {
      toast.error(err.message || t('sales.returnDialog.previewFailed'));
    }
  });

  const recordReturn = useMutation({
    ...createReturnMutation,
    onSuccess: (res) => {
      if (res && 'confirmOverdraft' in res && res.confirmOverdraft) {
        toast.warning(res.message || t('sales.returnDialog.overdraftRequired'));
        setConfirmOverdraft(true);
        return;
      }

      toast.success(t('sales.returnDialog.success'));
      void qc.invalidateQueries({ queryKey: saleKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || t('sales.returnDialog.failed'));
    }
  });

  const handleRunPreview = () => {
    const selectedItems: ReturnItemInput[] = sale.items
      .filter((item) => itemStates[item.id]?.selected)
      .map((item) => ({
        saleItemId: item.id,
        quantity: itemStates[item.id].quantity,
        condition: itemStates[item.id].condition
      }));

    if (selectedItems.length === 0) {
      toast.error(t('sales.returnDialog.selectAtLeastOne'));
      return;
    }

    preview.mutate({
      id: sale.id,
      input: {
        items: selectedItems,
        refundAmount: toPaisa(refundPkr)
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error(t('sales.returnDialog.reasonRequired'));
      return;
    }

    const selectedItems: ReturnItemInput[] = sale.items
      .filter((item) => itemStates[item.id]?.selected)
      .map((item) => ({
        saleItemId: item.id,
        quantity: itemStates[item.id].quantity,
        condition: itemStates[item.id].condition
      }));

    if (selectedItems.length === 0) {
      toast.error(t('sales.returnDialog.selectAtLeastOne'));
      return;
    }

    recordReturn.mutate({
      id: sale.id,
      input: {
        reason: reason.trim(),
        returnDate,
        items: selectedItems,
        refundAmount: toPaisa(refundPkr),
        confirmOverdraft,
        notes: notes.trim() || undefined
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{t('sales.returnDialog.title', { saleNo: sale.saleNo })}</DialogTitle>
          <DialogDescription>{t('sales.returnDialog.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {t('sales.returnDialog.selectItems')}
            </Label>
            <div className='space-y-2 rounded-lg border p-3'>
              {sale.items.map((item) => {
                const state = itemStates[item.id] || {
                  selected: false,
                  quantity: item.quantity,
                  condition: 'GOOD'
                };

                return (
                  <div
                    key={item.id}
                    className='flex flex-col gap-2 rounded-md border p-2 text-sm sm:flex-row sm:items-center sm:justify-between'
                  >
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id={`check-${item.id}`}
                        checked={state.selected}
                        onCheckedChange={(checked) => {
                          setItemStates((prev) => ({
                            ...prev,
                            [item.id]: { ...state, selected: Boolean(checked) }
                          }));
                        }}
                      />
                      <div>
                        <Label htmlFor={`check-${item.id}`} className='font-medium cursor-pointer'>
                          {item.productName}
                        </Label>
                        <p className='text-xs text-muted-foreground'>
                          {t('sales.returnDialog.sold')} {item.quantity}{' '}
                          {t('sales.returnDialog.price')} {formatPkr(item.unitPrice)}
                          {item.imei && ` · ${t('inventory.imeiLabel')} ${item.imei}`}
                        </p>
                      </div>
                    </div>

                    {state.selected && (
                      <div className='flex items-center gap-2 ps-6 sm:ps-0'>
                        <div className='w-20'>
                          <Input
                            type='number'
                            min={1}
                            max={item.quantity}
                            value={state.quantity}
                            onChange={(e) => {
                              const val = Math.max(
                                1,
                                Math.min(item.quantity, Number(e.target.value) || 1)
                              );
                              setItemStates((prev) => ({
                                ...prev,
                                [item.id]: { ...state, quantity: val }
                              }));
                            }}
                            className='h-8'
                          />
                        </div>
                        <Select
                          value={state.condition}
                          onValueChange={(val: 'GOOD' | 'DAMAGED' | null) => {
                            if (val) {
                              setItemStates((prev) => ({
                                ...prev,
                                [item.id]: { ...state, condition: val }
                              }));
                            }
                          }}
                        >
                          <SelectTrigger className='h-8 w-28'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='GOOD'>
                              {t('sales.returnDialog.conditionGood')}
                            </SelectItem>
                            <SelectItem value='DAMAGED'>
                              {t('sales.returnDialog.conditionDamaged')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='returnDate'>
                {t('sales.returnDialog.returnDate')} <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='returnDate'
                type='date'
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='refundAmount'>{t('sales.returnDialog.cashRefund')}</Label>
              <Input
                id='refundAmount'
                type='number'
                min={0}
                value={refundPkr}
                onChange={(e) => setRefundPkr(Math.max(0, Number(e.target.value) || 0))}
                placeholder='0'
              />
            </div>
          </div>

          <div className='flex justify-end'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleRunPreview}
              isLoading={preview.isPending}
            >
              <Icons.eye className='me-1.5 h-3.5 w-3.5' />
              {t('sales.returnDialog.previewSettlement')}
            </Button>
          </div>

          {previewData && (
            <div className='space-y-2 rounded-lg border bg-muted/40 p-3 text-xs'>
              <p className='font-semibold text-foreground'>
                {t('sales.returnDialog.settlementPreview')}
              </p>
              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <span className='text-muted-foreground'>
                    {t('sales.returnDialog.returnValue')}{' '}
                  </span>
                  <span className='font-medium'>{formatPkr(previewData.returnAmount)}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('sales.returnDialog.maxRefundableCash')}{' '}
                  </span>
                  <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                    {formatPkr(previewData.refundable)}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('sales.returnDialog.udharRelief')}{' '}
                  </span>
                  <span className='font-medium'>
                    {formatPkr(previewData.outstandingBefore - previewData.outstandingAfter)}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('sales.returnDialog.outstandingAfter')}{' '}
                  </span>
                  <span className='font-medium'>{formatPkr(previewData.outstandingAfter)}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('sales.returnDialog.drawerCashAfter')}{' '}
                  </span>
                  <span className='font-medium'>{formatPkr(previewData.cashAfter)}</span>
                </div>
              </div>

              {previewData.willCauseOverdraft && (
                <div className='mt-2 rounded border border-amber-500/30 bg-amber-500/10 p-2 text-amber-900 dark:text-amber-200'>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='return-overdraft'
                      checked={confirmOverdraft}
                      onCheckedChange={(checked) => setConfirmOverdraft(Boolean(checked))}
                    />
                    <Label htmlFor='return-overdraft' className='cursor-pointer text-xs'>
                      {t('sales.returnDialog.overdraftNotice')}
                    </Label>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className='space-y-1.5'>
            <Label htmlFor='returnReason'>
              {t('sales.returnDialog.reason')} <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='returnReason'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('sales.returnDialog.reasonPlaceholder')}
              rows={2}
              required
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='returnNotes'>{t('sales.returnDialog.notes')}</Label>
            <Input
              id='returnNotes'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('sales.returnDialog.notesPlaceholder')}
            />
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              disabled={recordReturn.isPending}
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={recordReturn.isPending}
              isLoading={recordReturn.isPending}
            >
              {t('sales.returnDialog.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
