'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ProductDialog } from '@/features/products/components/product-dialog';

export function ProductDialogWrapper() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      router.push('/dashboard/products');
    }
  };

  return <ProductDialog open={open} onOpenChange={handleOpenChange} product={null} />;
}
