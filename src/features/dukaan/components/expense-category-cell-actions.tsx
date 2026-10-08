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
import { useT } from '@/i18n/use-t';

export function ExpenseCategoryCellAction({ data }: { data: ExpenseCategory }) {
  const t = useT();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () => dukaan.deleteExpenseCategory(data.id),
    onSuccess: () => {
      toast.success(t('dukaan.category.expenseDeleted'));
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
        title={t('dukaan.category.expenseDeleteTitle')}
        description={t('dukaan.category.expenseDeleteDescription')}
        confirmLabel={t('common.delete')}
      />
      <ExpenseCategoryDialog open={editOpen} onOpenChange={setEditOpen} category={data} />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
          <span className='sr-only'>{t('common.openMenu')}</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-40'>
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                requestAnimationFrame(() => setEditOpen(true));
              }}
            >
              <Icons.edit className='me-2 h-4 w-4' /> {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant='destructive'
              onClick={() => {
                requestAnimationFrame(() => setDeleteOpen(true));
              }}
            >
              <Icons.trash className='me-2 h-4 w-4' /> {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
