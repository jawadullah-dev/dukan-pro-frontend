'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { BrandDialog, CategoryDialog } from './catalog-dialogs';
import { BrandsTable, CategoriesTable } from './tables/catalog-tables';

export function CategoriesHeaderAction() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type='button' size='sm' onClick={() => setOpen(true)}>
        <Icons.add className='mr-2 h-4 w-4' />
        Add category
      </Button>
      <CategoryDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function CategoriesPageClient() {
  return <CategoriesTable toolbarAction={<CategoriesHeaderAction />} />;
}

export function BrandsHeaderAction() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type='button' size='sm' onClick={() => setOpen(true)}>
        <Icons.add className='mr-2 h-4 w-4' />
        Add brand
      </Button>
      <BrandDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function BrandsPageClient() {
  return <BrandsTable toolbarAction={<BrandsHeaderAction />} />;
}
