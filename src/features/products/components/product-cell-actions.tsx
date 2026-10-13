'use client';

import { useState } from 'react';
import { IconDotsCircleHorizontal, IconTrash } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { ProductDTO } from '@/lib/api/types';

import { useDeleteProduct } from '../api/mutations';

interface ProductCellActionsProps {
  product: ProductDTO;
  onEdit: (product: ProductDTO) => void;
}

export function ProductCellActions({ product, onEdit }: ProductCellActionsProps) {
  const t = useTranslations('dukaan.product');
  const tCommon = useTranslations('common');
  const [open, setOpen] = useState(false);
  const deleteProduct = useDeleteProduct(product.id);

  const handleDelete = () => {
    deleteProduct.mutate();
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <IconDotsCircleHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => onEdit(product)}>{tCommon('edit')}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={deleteProduct.isPending}
          className='text-destructive'
        >
          <IconTrash className='mr-2 h-4 w-4' />
          {t('deactivate')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
