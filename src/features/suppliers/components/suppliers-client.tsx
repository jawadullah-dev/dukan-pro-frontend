'use client';

import { useState } from 'react';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { TablePageBody } from '@/components/layout/table-page-body';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';
import { SupplierDialog } from './supplier-dialog';
import { SuppliersTable } from './suppliers-table';

interface SuppliersHeaderActionProps {
  onAdd?: () => void;
}

export function SuppliersHeaderAction({ onAdd }: SuppliersHeaderActionProps) {
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
        {t('common.addSupplier')}
      </Button>
      {onAdd ? null : <SupplierDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}

export function SuppliersPageClient() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <TablePageBody>
      <SuppliersTable toolbarAction={<SuppliersHeaderAction onAdd={() => setOpen(true)} />} />
      <FloatingActionButton label={t('common.addSupplier')} onClick={() => setOpen(true)} />
      <SupplierDialog open={open} onOpenChange={setOpen} />
    </TablePageBody>
  );
}
