'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ProductDialog } from './catalog-dialogs';
import { ProductsTable } from './tables/catalog-tables';

export function ProductsHeaderAction({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <Button type='button' size='sm' onClick={() => setOpen(true)}>
        <Icons.add className='mr-2 h-4 w-4' />
        Add product
      </Button>
      <ProductDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next && defaultOpen) router.replace('/dashboard/products');
        }}
      />
    </>
  );
}

export function ProductsListClient({ defaultOpenAdd = false }: { defaultOpenAdd?: boolean }) {
  return <ProductsTable toolbarAction={<ProductsHeaderAction defaultOpen={defaultOpenAdd} />} />;
}
