'use client';

import { ExpenseCategoryDialog } from './expense-category-dialog';
import type { AddCategoryDialogProps } from '@/types/expense';

export function AddCategoryDialog({
  open,
  onOpenChange,
  onCategoryCreated
}: AddCategoryDialogProps) {
  return (
    <ExpenseCategoryDialog
      open={open}
      onOpenChange={onOpenChange}
      onCategoryCreated={onCategoryCreated}
    />
  );
}
