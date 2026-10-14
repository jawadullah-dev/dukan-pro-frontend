'use client';

import { useState } from 'react';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { TablePageBody } from '@/components/layout/table-page-body';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';
import { ProductDialog } from './product-dialog';
import { ProductsTable } from './products-table';
import type { ProductsHeaderActionProps } from '@/types/products';

export function ProductsHeaderAction({ onAdd }: ProductsHeaderActionProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    if (onAdd) onAdd();
    else setOpen(true);
  };
  return (
    <>
      <Button type='button' size='sm' onClick={handleOpen}>
        <Icons.add className='me-2 h-4 w-4' />
        {t('dukaan.product.add')}
      </Button>
      {onAdd ? null : <ProductDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}

export function ProductsPageClient() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <TablePageBody>
      <ProductsTable toolbarAction={<ProductsHeaderAction onAdd={() => setOpen(true)} />} />
      <FloatingActionButton label={t('dukaan.product.add')} onClick={() => setOpen(true)} />
      <ProductDialog open={open} onOpenChange={setOpen} />
    </TablePageBody>
  );
}
