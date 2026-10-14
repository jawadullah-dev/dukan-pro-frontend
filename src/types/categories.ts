import type { ReactNode } from 'react';
import type { CategoryDTO } from '@/lib/api/types';

export interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryDTO | null;
}

export interface CategoryDialogBodyProps {
  category?: CategoryDTO | null;
  onOpenChange: (open: boolean) => void;
}

export interface CategoriesHeaderActionProps {
  onAdd?: () => void;
}

export interface CategoryCellActionProps {
  data: CategoryDTO;
}

export interface CategoriesTableProps {
  toolbarAction?: ReactNode;
}
