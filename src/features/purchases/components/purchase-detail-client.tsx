'use client';

import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/data-table';
import { Icons } from '@/components/icons';
import { useT } from '@/i18n/use-t';
import { formatPkr } from '@/lib/dukaan/numbers';
import { purchaseKeys, purchaseQueryOptions } from '../api/queries';
import { CancelPurchaseDialog } from './cancel-purchase-dialog';

interface PurchaseDetailClientProps {
  id: string;
}

export function PurchaseDetailClient({ id }: PurchaseDetailClientProps) {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(purchaseQueryOptions(id));
  const t = useT();
  const [cancelOpen, setCancelOpen] = useState(false);

  return (
    <div className='space-y-4'>
      {cancelOpen && (
        <CancelPurchaseDialog
          purchase={data}
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          onSuccess={() => void qc.invalidateQueries({ queryKey: purchaseKeys.all })}
        />
      )}

      <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
        <div className='grid gap-1'>
          <h3 className='text-xl font-semibold'>{data.purchaseNo}</h3>
          <p className='text-muted-foreground text-sm'>
            {data.supplierName ?? '—'} · {data.purchaseDate ? data.purchaseDate.split('T')[0] : '—'}{' '}
            · {formatPkr(data.totalAmount)}
          </p>
          <div className='flex flex-wrap gap-2 pt-1'>
            <StatusBadge status={data.status} />
            {data.isOpeningStock ? (
              <Badge
                variant='outline'
                className='border-blue-500/40 text-[10px] text-blue-600 dark:text-blue-400'
              >
                {t('dukaan.purchase.openingStockLabel') || 'Opening Stock'}
              </Badge>
            ) : null}
          </div>
          {data.supplierInvoiceRef ? (
            <p className='text-muted-foreground text-sm'>
              {t('dukaan.purchase.invoiceRef') || 'Supplier Invoice'}: {data.supplierInvoiceRef}
            </p>
          ) : null}
        </div>

        {data.status === 'ACTIVE' && (
          <Button
            type='button'
            variant='destructive'
            className='self-start'
            onClick={() => setCancelOpen(true)}
          >
            <Icons.close className='me-2 h-4 w-4' />
            {t('dukaan.purchase.cancelTitle') || 'Cancel Purchase'}
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('dukaan.purchase.productHeader') || 'Product'}</TableHead>
            <TableHead>{t('dukaan.purchase.qtyHeader') || 'Quantity'}</TableHead>
            <TableHead>{t('dukaan.purchase.unitCostHeader') || 'Unit Cost'}</TableHead>
            <TableHead>{t('dukaan.purchase.lineHeader') || 'Total Cost'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className='font-medium'>{item.productName || item.productId}</div>
                {item.imeis && item.imeis.length > 0 && (
                  <div className='text-muted-foreground text-xs font-mono mt-0.5'>
                    IMEIs: {item.imeis.join(', ')}
                  </div>
                )}
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{formatPkr(item.unitCost)}</TableCell>
              <TableCell>{formatPkr(item.totalCost)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
