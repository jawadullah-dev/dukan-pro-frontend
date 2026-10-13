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

export interface SupplierDTO {
  id: string;
  shopId: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  openingBalance: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
