'use client';

import { ExpenseCategoryDialog } from './expense-category-dialog';
import type { ExpenseCategoryDTO } from '@/types/expense';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated?: (category: ExpenseCategoryDTO) => void;
}

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
