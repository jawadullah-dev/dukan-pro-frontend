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
import type { ExpenseCategory } from '@/lib/dukaan/types';
import { dukaanKeys } from '../api/queries';
import { ExpenseCategoryDialog } from './expense-category-dialogs';

export function ExpenseCategoryCellAction({ data }: { data: ExpenseCategory }) {
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () => dukaan.deleteExpenseCategory(data.id),
    onSuccess: () => {
      toast.success('Expense category deleted');
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
        title='Delete expense category?'
        description='If this category is used by expenses it will be deactivated instead of removed.'
        confirmLabel='Delete'
      />
      <ExpenseCategoryDialog open={editOpen} onOpenChange={setEditOpen} category={data} />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
          <span className='sr-only'>Open menu</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-40'>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                requestAnimationFrame(() => setEditOpen(true));
              }}
            >
              <Icons.edit className='mr-2 h-4 w-4' /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant='destructive'
              onClick={() => {
                requestAnimationFrame(() => setDeleteOpen(true));
              }}
            >
              <Icons.trash className='mr-2 h-4 w-4' /> Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
