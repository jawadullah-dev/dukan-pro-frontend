'use client';

import { useState } from 'react';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { TablePageBody } from '@/components/layout/table-page-body';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';
import type { CategoriesHeaderActionProps } from '@/types';
import { CategoryDialog } from './category-dialog';
import { CategoriesTable } from './categories-table';

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
