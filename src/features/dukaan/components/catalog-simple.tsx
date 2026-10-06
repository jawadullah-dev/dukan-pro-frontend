'use client';

import { useState } from 'react';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { TablePageBody } from '@/components/layout/table-page-body';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n';
import { BrandDialog, CategoryDialog } from './catalog-dialogs';
import { BrandsTable, CategoriesTable } from './tables/catalog-tables';

export function CategoriesHeaderAction({ onAdd }: { onAdd?: () => void }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    if (onAdd) onAdd();
    else setOpen(true);
  };
  return (
    <>
      <Button type='button' size='sm' onClick={handleOpen}>
        <Icons.add className='me-2 h-4 w-4' />
        {t('common.addCategory')}
      </Button>
      {onAdd ? null : <CategoryDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}

export function CategoriesPageClient() {
  const [open, setOpen] = useState(false);
  return (
    <TablePageBody>
      <CategoriesTable toolbarAction={<CategoriesHeaderAction onAdd={() => setOpen(true)} />} />
      <FloatingActionButton label={t('common.addCategory')} onClick={() => setOpen(true)} />
      <CategoryDialog open={open} onOpenChange={setOpen} />
    </TablePageBody>
  );
}

export function BrandsHeaderAction({ onAdd }: { onAdd?: () => void }) {
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
  const [open, setOpen] = useState(false);
  return (
    <TablePageBody>
      <BrandsTable toolbarAction={<BrandsHeaderAction onAdd={() => setOpen(true)} />} />
      <FloatingActionButton label={t('common.addBrand')} onClick={() => setOpen(true)} />
      <BrandDialog open={open} onOpenChange={setOpen} />
    </TablePageBody>
  );
}
