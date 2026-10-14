import type { ReactNode } from 'react';
import type { SupplierDTO } from '@/lib/api/types';

export interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: SupplierDTO | null;
}

export interface SupplierDialogBodyProps {
  supplier?: SupplierDTO | null;
  onOpenChange: (open: boolean) => void;
}

export interface SupplierFormState {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  opening_balance: number;
}

export interface SuppliersHeaderActionProps {
  onAdd?: () => void;
}

export interface SupplierCellActionProps {
  data: SupplierDTO;
}

export interface SuppliersTableProps {
  toolbarAction?: ReactNode;
}
