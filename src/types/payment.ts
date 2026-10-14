import type { ReactNode } from 'react';
import type { Row } from '@tanstack/react-table';
import type { PaymentDTO, CustomerDTO, CancelPaymentInput } from '@/lib/api/types';

export type PaymentMethodOption =
  | 'CASH'
  | 'JAZZCASH'
  | 'EASYPAISA'
  | 'BANK'
  | 'BANK_TRANSFER'
  | 'CHEQUE'
  | 'OTHER';

export interface PaymentRowActionsProps {
  payment: PaymentDTO;
  onCancel: (payment: PaymentDTO) => void;
}

export interface PaymentsTableProps {
  toolbarAction?: ReactNode;
  searchParams?: Record<string, string | string[] | undefined>;
}

export interface CancelPaymentDialogProps {
  payment: PaymentDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface CustomerSelectComboboxProps {
  value: string;
  onSelectCustomer: (customer: CustomerDTO | null) => void;
  selectedCustomer?: CustomerDTO | null;
  placeholder?: string;
  disabled?: boolean;
}

export interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCustomerId?: string;
  onSuccess?: () => void;
}

export interface PaymentsListFilters {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  saleId?: string;
  receiptGroupId?: string;
  status?: 'ACTIVE' | 'CANCELLED';
  from?: string;
  to?: string;
  sortBy?: 'paymentDate' | 'amount' | 'createdAt' | 'updatedAt' | 'customerName' | 'method';
  sortOrder?: 'asc' | 'desc';
}

export interface CancelPaymentMutationVariables {
  id: string;
  input: CancelPaymentInput;
}

export interface CancelPaymentResult {
  success: boolean;
  confirmOverdraft?: boolean;
  shortfall?: number;
  message?: string;
}

export interface PaymentCreateBody {
  notes?: string;
  method?: string;
  [key: string]: unknown;
}
