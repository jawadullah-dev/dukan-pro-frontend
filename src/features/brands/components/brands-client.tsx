'use client';

import { useState } from 'react';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { TablePageBody } from '@/components/layout/table-page-body';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';
import type { BrandsHeaderActionProps } from '@/types';
import { BrandDialog } from './brand-dialog';
import { BrandsTable } from './brands-table';

export function BrandsHeaderAction({ onAdd }: BrandsHeaderActionProps) {
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
        {t('common.addBrand')}
      </Button>
      {onAdd ? null : <BrandDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}

export function BrandsPageClient() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <TablePageBody>
      <BrandsTable toolbarAction={<BrandsHeaderAction onAdd={() => setOpen(true)} />} />
      <FloatingActionButton label={t('common.addBrand')} onClick={() => setOpen(true)} />
      <BrandDialog open={open} onOpenChange={setOpen} />
    </TablePageBody>
  );
}
