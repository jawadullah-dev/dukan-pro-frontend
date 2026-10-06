'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';
import { ProductDialog } from './catalog-dialogs';
import { ProductsTable } from './tables/catalog-tables';

export function ProductsHeaderAction({
  className,
  onAdd
}: {
  className?: string;
  onAdd: () => void;
}) {
  const t = useT();
  return (
    <Button type='button' className={className ?? 'h-8'} onClick={onAdd}>
      <Icons.add className='me-2 h-4 w-4' />
      {t('common.addProduct')}
    </Button>
  );
}

export function ProductsListClient({ defaultOpenAdd = false }: { defaultOpenAdd?: boolean }) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpenAdd);

  return (
    <>
      <ProductsTable
        toolbarAction={<ProductsHeaderAction className='h-8' onAdd={() => setOpen(true)} />}
      />
      <FloatingActionButton label={t('common.addProduct')} onClick={() => setOpen(true)} />
      <ProductDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next && defaultOpenAdd) router.replace('/dashboard/products');
        }}
      />
    </>
  );
}
