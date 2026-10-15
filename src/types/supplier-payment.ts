export interface SupplierPaymentDTO {
  id: string;
  shopId: string;
  supplierId: string;
  supplierName?: string;
  purchaseId?: string | null;
  purchaseNo?: string | null;
  amount: number;
  paymentDate: string;
  status: 'ACTIVE' | 'CANCELLED';
  cancelledAt?: string | null;
  cancelReason?: string | null;
  cancelledById?: string | null;
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

import type { SupplierDTO } from '@/lib/api/types';
import type { EntityComboboxItem } from './common';
export type { SupplierDTO };

export interface SupplierComboboxItem extends EntityComboboxItem {
  raw: SupplierDTO;
}

export interface UnpaidPurchaseDTO {
  id: string;
  purchaseNo: string;
  supplierInvoiceRef?: string | null;
  purchaseDate: string;
  totalAmount: number;
  paidAmount: number;
  remaining: number;
}

export interface SupplierPayableDTO {
  supplierId: string;
  supplierName: string;
  openingBalance: number;
  openingRemaining: number;
  totalPurchases: number;
  totalPaid: number;
  payable: number;
  unpaidPurchases: UnpaidPurchaseDTO[];
}

export interface CreateSupplierPaymentInput {
  supplierId: string;
  purchaseId?: string | null;
  amount: number;
  paymentDate: string;
  confirmOverdraft?: boolean;
  notes?: string;
}

export interface SupplierPaymentOverdraftPrompt {
  confirmOverdraft: true;
  shortfall: number;
  message: string;
}

export interface SupplierPaymentSuccessResult {
  status: boolean;
  message: string;
  confirmOverdraft?: false;
}

export type CreateSupplierPaymentResult =
  | SupplierPaymentSuccessResult
  | SupplierPaymentOverdraftPrompt;

export interface CancelSupplierPaymentInput {
  cancelReason: string;
}

export interface CancelSupplierPaymentMutationVariables {
  id: string;
  input: CancelSupplierPaymentInput;
}

export interface CancelSupplierPaymentResult {
  status: boolean;
  message: string;
}

export interface SupplierPaymentQueryFilter {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  supplierId?: string;
  purchaseId?: string;
  status?: 'ACTIVE' | 'CANCELLED';
  from?: string;
  to?: string;
  sortBy?: 'paymentDate' | 'amount' | 'createdAt' | 'updatedAt' | 'supplierName' | 'purchaseNo';
  sortOrder?: 'asc' | 'desc';
}

export interface CancelSupplierPaymentDialogProps {
  payment: SupplierPaymentDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface RecordSupplierPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSupplierId?: string;
  onSuccess?: () => void;
}

export interface SupplierPaymentDetailSheetProps {
  payment: SupplierPaymentDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelClick?: (payment: SupplierPaymentDTO) => void;
}

export interface SupplierPaymentRowActionsProps {
  payment: SupplierPaymentDTO;
  onCancel: (payment: SupplierPaymentDTO) => void;
}

export interface SupplierPaymentsTableProps {
  toolbarAction?: React.ReactNode;
  searchParams?: Record<string, string | string[] | undefined>;
}

export interface SupplierSelectComboboxProps {
  value?: string;
  selectedSupplier?: SupplierDTO | null;
  onSelectSupplier: (supplier: SupplierDTO | null) => void;
  placeholder?: string;
  disabled?: boolean;
}
