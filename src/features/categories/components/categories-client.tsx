'use client';

import { useState } from 'react';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { TablePageBody } from '@/components/layout/table-page-body';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';
import { BrandDialog, CategoryDialog } from '@/features/dukaan/components/catalog-dialogs';
import { BrandsTable, CategoriesTable } from '@/features/dukaan/components/tables/catalog-tables';

interface CategoriesHeaderActionProps {
  onAdd?: () => void;
}

export function CategoriesHeaderAction({ onAdd }: CategoriesHeaderActionProps) {
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
        {t('common.addCategory')}
      </Button>
      {onAdd ? null : <CategoryDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}

export function CategoriesPageClient() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <TablePageBody>
      <CategoriesTable toolbarAction={<CategoriesHeaderAction onAdd={() => setOpen(true)} />} />
      <FloatingActionButton label={t('common.addCategory')} onClick={() => setOpen(true)} />
      <CategoryDialog open={open} onOpenChange={setOpen} />
    </TablePageBody>
  );
}

interface BrandsHeaderActionProps {
  onAdd?: () => void;
}

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
