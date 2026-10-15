import type { ReactNode } from 'react';
import type { BrandDTO } from '@/lib/api/types';

export interface BrandListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface BrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: BrandDTO | null;
}

export interface BrandsHeaderActionProps {
  onAdd?: () => void;
}

export interface BrandCellActionProps {
  data: BrandDTO;
}

export interface BrandsTableProps {
  toolbarAction?: ReactNode;
}
