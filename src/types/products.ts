import type { ReactNode } from 'react';
import type { ProductDTO, ProductImageDTO } from '@/lib/api/types';

export interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductDTO | null;
}

export interface ProductDialogBodyProps {
  product?: ProductDTO | null;
  onOpenChange: (open: boolean) => void;
}

export interface ProductPhotoManagerProps {
  productId: string;
  images: ProductImageDTO[];
  onChange: (images: ProductImageDTO[]) => void;
}

export interface ProductsHeaderActionProps {
  onAdd?: () => void;
}

export interface ProductCellActionProps {
  data: ProductDTO;
}

export interface ProductsTableProps {
  toolbarAction?: ReactNode;
}
