import type { ReactNode } from 'react';
import type { BrandDTO } from '@/lib/api/types';

export interface BrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: BrandDTO | null;
}

export interface BrandDialogBodyProps {
  brand?: BrandDTO | null;
  onOpenChange: (open: boolean) => void;
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
