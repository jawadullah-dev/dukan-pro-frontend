export interface ApiSuccessResponse<T> {
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ---------------------------------------------------------------------------
// Domain DTOs — shapes returned by the NestJS backend (camelCase)
// ---------------------------------------------------------------------------

/** Matches the BrandResponseDto from the NestJS brands controller. */
export interface BrandDTO {
  id: string;
  shopId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Matches the ResponseCustomerDto from the NestJS customers controller. */
export interface CustomerDTO {
  id: string;
  shopId: string;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  openingBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Matches ResponseSaleItemDto from NestJS sales controller. */
export interface SaleItemDTO {
  id: string;
  productId: string;
  productName: string;
  inventoryUnitId?: string | null;
  imei?: string | null;
  quantity: number;
  unitPrice: number; // in PAISA
  unitCost: number; // in PAISA
  total: number; // in PAISA
}

export interface SalePaymentDTO {
  id: string;
  amount: number; // in PAISA
  method: 'CASH' | 'BANK' | 'MOBILE_WALLET';
  status: 'ACTIVE' | 'CANCELLED';
  receiptGroupId?: string | null;
  createdAt: string;
}

export interface ReturnItemDTO {
  id: string;
  saleItemId: string;
  productId: string;
  productName: string;
  inventoryUnitId?: string | null;
  imei?: string | null;
  quantity: number;
  condition: 'GOOD' | 'DAMAGED';
}

export interface ReturnRefundDTO {
  id: string;
  amount: number; // in PAISA
  method: string;
  createdAt: string;
}

export interface SaleReturnDTO {
  id: string;
  saleId: string;
  saleNo: string;
  customerId?: string | null;
  customerName?: string | null;
  returnDate: string;
  reason: string;
  returnAmount: number; // in PAISA
  status: string;
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  items: ReturnItemDTO[];
  refunds: ReturnRefundDTO[];
}

/** Matches ResponseSaleDto from NestJS sales controller. */
export interface SaleDTO {
  id: string;
  shopId: string;
  customerId?: string | null;
  customerName?: string | null;
  saleNo: string;
  saleDate: string;
  subtotal: number; // in PAISA
  discount: number; // in PAISA
  totalAmount: number; // in PAISA
  dueDate?: string | null;
  status: 'ACTIVE' | 'CANCELLED';
  cancelledAt?: string | null;
  cancelReason?: string | null;
  cancelledById?: string | null;
  clientRequestId: string;
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  items: SaleItemDTO[];
  payments: SalePaymentDTO[];
  returns: SaleReturnDTO[];
}

export interface CreateSaleItemInput {
  productId: string;
  quantity: number;
  unitPrice: number; // in PAISA
  inventoryUnitId?: string;
}

export interface CreateSaleInput {
  clientRequestId: string;
  saleDate: string;
  customerId?: string;
  items: CreateSaleItemInput[];
  discount?: number; // in PAISA
  paidNow?: number; // in PAISA
  dueDate?: string;
  notes?: string;
}

export interface CancelSaleInput {
  cancelReason: string;
  confirmOverdraft?: boolean;
}

export interface CancelImpactStockItemDTO {
  productName: string;
  imei?: string | null;
  quantityChange: number;
}

export interface CancelImpactDTO {
  recordType: string;
  recordId: string;
  recordNo?: string | null;
  currentCash: number; // in PAISA
  cashReversedAmount: number; // in PAISA
  cashReversedDirection: 'OUT' | 'IN';
  cashAfter: number; // in PAISA
  willCauseOverdraft: boolean;
  customerUdharAfter?: number | null; // in PAISA
  supplierPayableAfter?: number | null; // in PAISA
  stockItems: CancelImpactStockItemDTO[];
  blocked: boolean;
  blockedReason?: string | null;
}

export interface ReturnItemInput {
  saleItemId: string;
  quantity?: number;
  condition: 'GOOD' | 'DAMAGED';
}

export interface ReturnPreviewInput {
  items: ReturnItemInput[];
  refundAmount?: number; // in PAISA
}

export interface ReturnPreviewLineDTO {
  saleItemId: string;
  productName: string;
  imei?: string | null;
  quantity: number;
  condition: 'GOOD' | 'DAMAGED';
}

export interface ReturnPreviewDTO {
  saleId: string;
  saleNo: string;
  customerName?: string | null;
  returnAmount: number; // in PAISA
  outstandingBefore: number; // in PAISA
  outstandingAfter: number; // in PAISA
  refundable: number; // in PAISA
  refundAmount: number; // in PAISA
  currentCash: number; // in PAISA
  cashAfter: number; // in PAISA
  willCauseOverdraft: boolean;
  items: ReturnPreviewLineDTO[];
}

export interface CreateReturnInput {
  reason: string;
  returnDate: string;
  items: ReturnItemInput[];
  refundAmount?: number; // in PAISA
  confirmOverdraft?: boolean;
  notes?: string;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: ApiErrorBody
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Matches the CategoryResponseDto from the NestJS categories controller. */
export interface CategoryDTO {
  id: string;
  shopId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Matches ResponsePaymentDto from the NestJS payments controller. */
export interface PaymentDTO {
  id: string;
  shopId: string;
  customerId?: string | null;
  customerName?: string | null;
  saleId?: string | null;
  saleNo?: string | null;
  receiptGroupId?: string | null;
  amount: number; // in PAISA
  paymentDate: string;
  method: 'CASH' | string;
  status: 'ACTIVE' | 'CANCELLED';
  cancelledAt?: string | null;
  cancelReason?: string | null;
  cancelledById?: string | null;
  clientRequestId: string;
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  clientRequestId: string;
  customerId: string;
  amount: number; // in PAISA
  paymentDate: string;
  salesIds?: string[];
  method?: 'CASH' | 'JAZZCASH' | 'EASYPAISA' | 'BANK' | string;
  notes?: string;
}

export interface CancelPaymentInput {
  cancelReason: string;
  confirmOverdraft?: boolean;
}

export * from '@/types/supplier-payment';
