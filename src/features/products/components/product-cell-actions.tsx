'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { dukaan } from '@/lib/dukaan';
import type { Brand, Category, Product } from '@/lib/dukaan/types';
import { dukaanKeys } from '@/features/dukaan/api/queries';
import {
  BrandDialog,
  CategoryDialog,
  ProductDialog
} from '@/features/dukaan/components/catalog-dialogs';
import { useT } from '@/i18n/use-t';

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

function ActionMenu({ onEdit, onDelete }: ActionMenuProps) {
  const t = useT();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
        <span className='sr-only'>{t('common.openMenu')}</span>
        <Icons.ellipsis className='h-4 w-4' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              requestAnimationFrame(onEdit);
            }}
          >
            <Icons.edit className='me-2 h-4 w-4' /> {t('common.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              requestAnimationFrame(onDelete);
            }}
          >
            <Icons.trash className='me-2 h-4 w-4' /> {t('common.delete')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface CategoryCellActionProps {
  data: Category;
}

export function CategoryCellAction({ data }: CategoryCellActionProps) {
  const t = useT();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () => dukaan.deleteCategory(data.id),
    onSuccess: () => {
      toast.success(t('dukaan.category.deleted'));
      setDeleteOpen(false);
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => remove.mutate()}
        loading={remove.isPending}
        title={t('dukaan.category.deleteTitle')}
        description={t('dukaan.category.deleteDescription')}
        confirmLabel={t('common.delete')}
      />
      <CategoryDialog open={editOpen} onOpenChange={setEditOpen} category={data} />
      <ActionMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
    </>
  );
}

interface BrandCellActionProps {
  data: Brand;
}

export function BrandCellAction({ data }: BrandCellActionProps) {
  const t = useT();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () => dukaan.deleteBrand(data.id),
    onSuccess: () => {
      toast.success(t('dukaan.brand.deleted'));
      setDeleteOpen(false);
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => remove.mutate()}
        loading={remove.isPending}
        title={t('dukaan.brand.deleteTitle')}
        description={t('dukaan.brand.deleteDescription')}
        confirmLabel={t('common.delete')}
      />
      <BrandDialog open={editOpen} onOpenChange={setEditOpen} brand={data} />
      <ActionMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
    </>
  );
}

interface ProductCellActionProps {
  data: Product;
}

export function ProductCellAction({ data }: ProductCellActionProps) {
  const t = useT();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () => dukaan.deleteProduct(data.id),
    onSuccess: () => {
      toast.success(t('dukaan.product.deleted'));
      setDeleteOpen(false);
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => remove.mutate()}
        loading={remove.isPending}
        title={t('dukaan.product.deleteTitle')}
        description={t('dukaan.product.deleteDescription')}
        confirmLabel={t('common.delete')}
      />
      <ProductDialog open={editOpen} onOpenChange={setEditOpen} product={data} />
      <ActionMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
    </>
  );
}
