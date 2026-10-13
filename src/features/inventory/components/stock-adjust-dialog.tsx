'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DialogCancelButton } from '@/components/common/dialog-actions';
import { Icons } from '@/components/icons';
import { createInventoryAdjustment } from '../api/service';
import { inventoryKeys, inventoryStockQueryOptions } from '../api/queries';
import type { CreateInventoryAdjustmentInput, InventoryItemDTO } from '@/lib/api/types';
import { ValidationError } from '@/lib/errors';

interface StockAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProduct?: InventoryItemDTO | null;
}

export function StockAdjustDialog({ open, onOpenChange, initialProduct }: StockAdjustDialogProps) {
  const qc = useQueryClient();
  const { data: stockData } = useQuery(inventoryStockQueryOptions({ limit: 100 }));
  const products = stockData?.items ?? [];

  const [productId, setProductId] = useState<string>(initialProduct?.id ?? '');
  const [type, setType] = useState<'ADJUSTMENT' | 'DAMAGED' | 'LOST'>('ADJUSTMENT');
  const [countedQuantity, setCountedQuantity] = useState<number>(initialProduct?.inStock ?? 0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImei, setSelectedImei] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const selectedProduct =
    products.find((p) => p.id === productId) ??
    (initialProduct?.id === productId ? initialProduct : null);

  const isSerialized = selectedProduct?.trackingType === 'SERIALIZED';

  useEffect(() => {
    if (initialProduct) {
      setProductId(initialProduct.id);
      setCountedQuantity(initialProduct.inStock);
    } else if (products.length > 0 && !productId) {
      setProductId(products[0].id);
      setCountedQuantity(products[0].inStock);
    }
  }, [initialProduct, products, productId]);

  useEffect(() => {
    if (selectedProduct) {
      setCountedQuantity(selectedProduct.inStock);
      if (selectedProduct.imeis && selectedProduct.imeis.length > 0) {
        setSelectedImei(selectedProduct.imeis[0]);
      } else {
        setSelectedImei('');
      }
      if (selectedProduct.trackingType === 'SERIALIZED' && type === 'ADJUSTMENT') {
        setType('DAMAGED');
      }
    }
  }, [productId]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!productId) throw new ValidationError('Please select a product');
      if (!reason.trim()) throw new ValidationError('Reason is required for all stock changes');

      const payload: CreateInventoryAdjustmentInput = {
        productId,
        type,
        reason: reason.trim()
      };

      if (type === 'ADJUSTMENT') {
        if (isSerialized) {
          throw new ValidationError(
            'Count adjustments are only allowed for non-serialized products'
          );
        }
        payload.countedQuantity = Number(countedQuantity);
      } else {
        if (isSerialized) {
          if (!selectedImei) throw new ValidationError('Please select the unit IMEI to write off');
          payload.inventoryUnitId = selectedImei;
        } else {
          payload.quantity = Math.max(1, Number(quantity));
        }
      }

      return createInventoryAdjustment(payload);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Stock change recorded successfully');
      void qc.invalidateQueries({ queryKey: inventoryKeys.all });
      onOpenChange(false);
      setReason('');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to record stock change');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>Record Stock Adjustment</DialogTitle>
            <DialogDescription>
              Record a physical count adjustment or write off damaged / lost stock.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='adj-product'>Product</Label>
              <Select value={productId} onValueChange={(val) => setProductId(val ?? '')}>
                <SelectTrigger id='adj-product' className='w-full'>
                  <SelectValue placeholder='Select a product'>
                    {selectedProduct
                      ? `${selectedProduct.name} (${selectedProduct.inStock} in stock · ${selectedProduct.trackingType})`
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.inStock} in stock · {p.trackingType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='adj-type'>Change Type</Label>
              <Select
                value={type}
                onValueChange={(val) => {
                  if (val) setType(val as 'ADJUSTMENT' | 'DAMAGED' | 'LOST');
                }}
              >
                <SelectTrigger id='adj-type' className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {!isSerialized && (
                    <SelectItem value='ADJUSTMENT'>
                      Shelf Count Adjustment (Correct shelf count)
                    </SelectItem>
                  )}
                  <SelectItem value='DAMAGED'>Damaged Stock (Write off)</SelectItem>
                  <SelectItem value='LOST'>Lost Stock (Write off)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === 'ADJUSTMENT' ? (
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='adj-count'>Physical Count on Shelf</Label>
                  {selectedProduct && (
                    <span className='text-xs text-muted-foreground'>
                      Current system stock: {selectedProduct.inStock}
                    </span>
                  )}
                </div>
                <Input
                  id='adj-count'
                  type='number'
                  min={0}
                  value={countedQuantity}
                  onChange={(e) => setCountedQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  required
                />
                {selectedProduct && (
                  <p className='text-[11px] text-muted-foreground'>
                    Change:{' '}
                    <span
                      className={
                        countedQuantity - selectedProduct.inStock > 0
                          ? 'font-semibold text-emerald-600'
                          : countedQuantity - selectedProduct.inStock < 0
                            ? 'font-semibold text-rose-600'
                            : 'font-semibold text-muted-foreground'
                      }
                    >
                      {countedQuantity - selectedProduct.inStock > 0 ? '+' : ''}
                      {countedQuantity - selectedProduct.inStock}
                    </span>{' '}
                    units
                  </p>
                )}
              </div>
            ) : isSerialized ? (
              <div className='space-y-1.5'>
                <Label htmlFor='adj-imei'>Unit IMEI to Write Off</Label>
                {selectedProduct?.imeis && selectedProduct.imeis.length > 0 ? (
                  <Select value={selectedImei} onValueChange={(val) => setSelectedImei(val ?? '')}>
                    <SelectTrigger id='adj-imei'>
                      <SelectValue placeholder='Select IMEI'>
                        {selectedImei ? `IMEI: ${selectedImei}` : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct.imeis.map((imei) => (
                        <SelectItem key={imei} value={imei}>
                          IMEI: {imei}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id='adj-imei'
                    placeholder='Enter unit IMEI or ID'
                    value={selectedImei}
                    onChange={(e) => setSelectedImei(e.target.value)}
                    required
                  />
                )}
              </div>
            ) : (
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='adj-qty'>Quantity to Write Off</Label>
                  {selectedProduct && (
                    <span className='text-xs text-muted-foreground'>
                      Available: {selectedProduct.inStock}
                    </span>
                  )}
                </div>
                <Input
                  id='adj-qty'
                  type='number'
                  min={1}
                  max={selectedProduct?.inStock ?? 9999}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                />
              </div>
            )}

            <div className='space-y-1.5'>
              <Label htmlFor='adj-reason'>Reason (Mandatory)</Label>
              <Textarea
                id='adj-reason'
                placeholder='e.g., Physical stock count difference, item cracked in box'
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <DialogCancelButton onClick={() => onOpenChange(false)} disabled={mutation.isPending} />
            <Button type='submit' disabled={mutation.isPending || !reason.trim()}>
              {mutation.isPending && <Icons.spinner className='me-2 h-4 w-4 animate-spin' />}
              Record Change
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
