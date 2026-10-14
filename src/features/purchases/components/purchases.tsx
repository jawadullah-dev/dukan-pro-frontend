'use client';

import { useState } from 'react';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { TablePageBody } from '@/components/layout/table-page-body';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';
import type { PurchasesHeaderActionProps, PurchasesListClientProps } from '@/types/purchases';
import { PurchasesTable } from './purchases-table';
import { PurchaseCreateDialog } from './purchase-create-dialog';

export { PurchaseDetailClient } from './purchase-detail-client';

export function PurchasesHeaderAction({ className, onAdd }: PurchasesHeaderActionProps) {
  const t = useT();
  return (
    <Button type='button' className={className ?? 'h-8'} onClick={onAdd}>
      <Icons.add className='me-2 h-4 w-4' />
      {t('common.newPurchase')}
    </Button>
  );
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
