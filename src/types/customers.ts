import type { ReactNode } from 'react';
import type { CustomerDTO } from '@/lib/api/types';

export interface CustomerListFilters {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'phone' | 'isActive' | 'openingBalance' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCustomerInput {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  openingBalance?: number;
  isActive?: boolean;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  openingBalance?: number;
  isActive?: boolean;
}

export interface CustomerMutationResult {
  status: boolean;
  message: string;
}

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
