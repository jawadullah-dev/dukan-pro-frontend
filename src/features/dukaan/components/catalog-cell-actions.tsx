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
import { dukaanKeys } from '../api/queries';
import { BrandDialog, CategoryDialog, ProductDialog } from './catalog-dialogs';

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

function ActionMenu({ onEdit, onDelete }: ActionMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
        <span className='sr-only'>Open menu</span>
        <Icons.ellipsis className='h-4 w-4' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              requestAnimationFrame(onEdit);
            }}
          >
            <Icons.edit className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              requestAnimationFrame(onDelete);
            }}
          >
            <Icons.trash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CategoryCellAction({ data }: { data: Category }) {
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () => dukaan.deleteCategory(data.id),
    onSuccess: () => {
      toast.success('Category deleted');
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
        title='Delete category?'
        description='If this category is used by products it will be deactivated instead of removed.'
        confirmLabel='Delete'
      />
      <CategoryDialog open={editOpen} onOpenChange={setEditOpen} category={data} />
      <ActionMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
    </>
  );
}

export function BrandCellAction({ data }: { data: Brand }) {
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () => dukaan.deleteBrand(data.id),
    onSuccess: () => {
      toast.success('Brand deleted');
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
        title='Delete brand?'
        description='If this brand is used by products it will be deactivated instead of removed.'
        confirmLabel='Delete'
      />
      <BrandDialog open={editOpen} onOpenChange={setEditOpen} brand={data} />
      <ActionMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
    </>
  );
}

export function ProductCellAction({ data }: { data: Product }) {
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () => dukaan.deleteProduct(data.id),
    onSuccess: () => {
      toast.success('Product deleted');
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
        title='Delete product?'
        description='If this product has stock or sales history it will be deactivated instead of removed.'
        confirmLabel='Delete'
      />
      <ProductDialog open={editOpen} onOpenChange={setEditOpen} product={data} />
      <ActionMenu onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
    </>
  );
}
