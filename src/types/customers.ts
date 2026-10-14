import type { ReactNode } from 'react';
import type { CustomerDTO } from '@/lib/api/types';

export interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerDTO | null;
}

export interface CustomerDialogBodyProps {
  customer?: CustomerDTO | null;
  onOpenChange: (open: boolean) => void;
}

export interface CustomerFormState {
  name: string;
  phone: string;
  address: string;
  notes: string;
  opening_balance: number;
}

export interface CustomerCellActionProps {
  data: CustomerDTO;
}

export interface CustomersTableProps {
  toolbarAction?: ReactNode;
}

export interface CustomersHeaderActionProps {
  onAdd?: () => void;
}

export interface CustomerLedgerClientProps {
  id: string;
}
