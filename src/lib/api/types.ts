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

export interface BrandDTO {
  id: string;
  shopId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export interface SaleItemDTO {
  id: string;
  productId: string;
  productName: string;
  inventoryUnitId?: string | null;
  imei?: string | null;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  total: number;
}

export interface SalePaymentDTO {
  id: string;
  amount: number;
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
  amount: number;
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
  returnAmount: number;
  status: string;
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  items: ReturnItemDTO[];
  refunds: ReturnRefundDTO[];
}

export interface SaleDTO {
  id: string;
  shopId: string;
  customerId?: string | null;
  customerName?: string | null;
  saleNo: string;
  saleDate: string;
  subtotal: number;
  discount: number;
  totalAmount: number;
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
  unitPrice: number;
  inventoryUnitId?: string;
}

export interface CreateSaleInput {
  clientRequestId: string;
  saleDate: string;
  customerId?: string;
  items: CreateSaleItemInput[];
  discount?: number;
  paidNow?: number;
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
  currentCash: number;
  cashReversedAmount: number;
  cashReversedDirection: 'OUT' | 'IN';
  cashAfter: number;
  willCauseOverdraft: boolean;
  customerUdharAfter?: number | null;
  supplierPayableAfter?: number | null;
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
  refundAmount?: number;
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
  returnAmount: number;
  outstandingBefore: number;
  outstandingAfter: number;
  refundable: number;
  refundAmount: number;
  currentCash: number;
  cashAfter: number;
  willCauseOverdraft: boolean;
  items: ReturnPreviewLineDTO[];
}

export interface CreateReturnInput {
  reason: string;
  returnDate: string;
  items: ReturnItemInput[];
  refundAmount?: number;
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

export interface CategoryDTO {
  id: string;
  shopId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDTO {
  id: string;
  shopId: string;
  customerId?: string | null;
  customerName?: string | null;
  saleId?: string | null;
  saleNo?: string | null;
  receiptGroupId?: string | null;
  amount: number;
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
  amount: number;
  paymentDate: string;
  salesIds?: string[];
  method?: 'CASH' | 'JAZZCASH' | 'EASYPAISA' | 'BANK' | string;
  notes?: string;
}

export interface CancelPaymentInput {
  cancelReason: string;
  confirmOverdraft?: boolean;
}

export interface PurchaseItemDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  imeis?: string[];
}

export interface PurchaseDTO {
  id: string;
  shopId: string;
  supplierId: string;
  supplierName?: string;
  purchaseNo: string;
  supplierInvoiceRef?: string | null;
  purchaseDate: string;
  totalAmount: number;
  isOpeningStock: boolean;
  status: 'ACTIVE' | 'CANCELLED';
  cancelledAt?: string | null;
  cancelReason?: string | null;
  cancelledById?: string | null;
  clientRequestId: string;
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseItemDTO[];
}

export interface CreatePurchaseItemInput {
  productId: string;
  quantity: number;
  unitCost: number;
  imeis?: string[];
  condition?: 'NEW' | 'USED';
}

export interface CreatePurchaseInput {
  clientRequestId: string;
  supplierId: string;
  supplierInvoiceRef?: string;
  purchaseDate: string;
  items: CreatePurchaseItemInput[];
  paidNow?: number;
  isOpeningStock?: boolean;
  confirmOverdraft?: boolean;
  notes?: string;
}

export interface CancelPurchaseInput {
  reason?: string;
  cancelReason?: string;
  confirmOverdraft?: boolean;
}

export interface CreatePurchaseResult {
  confirmOverdraft?: boolean;
  shortfall?: number;
  message?: string;
  success?: boolean;
  purchase?: PurchaseDTO;
}

export interface InventoryItemDTO {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  categoryName?: string | null;
  brandName?: string | null;
  trackingType: 'QUANTITY' | 'SERIALIZED';
  inStock: number;
  stockValue: number;
  lowStock: boolean;
  imeis?: string[];
}

export interface InventoryAdjustmentDTO {
  id: string;
  shopId: string;
  productId: string;
  productName: string;
  inventoryUnitId?: string | null;
  imei?: string | null;
  type: 'ADJUSTMENT' | 'DAMAGED' | 'LOST';
  quantityChange: number;
  reason: string;
  referenceType?: string | null;
  referenceId?: string | null;
  createdAt: string;
}

export interface CreateInventoryAdjustmentInput {
  productId: string;
  type: 'ADJUSTMENT' | 'DAMAGED' | 'LOST';
  reason: string;
  countedQuantity?: number;
  quantity?: number;
  inventoryUnitId?: string;
}

export interface CreateInventoryAdjustmentResult {
  kind?: string;
  message?: string;
  data?: unknown;
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

export interface CreateSupplierInput {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  openingBalance?: number;
  isActive?: boolean;
}

export interface UpdateSupplierInput {
  name?: string;
  phone?: string;
  address?: string;
  notes?: string;
  openingBalance?: number;
  isActive?: boolean;
}

export type TrackingType = 'QUANTITY' | 'SERIALIZED';

export type PtaStatus = 'PTA_APPROVED' | 'NON_PTA';

export interface ProductImageDTO {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ProductDTO {
  id: string;
  shopId: string;
  categoryId: string;
  brandId: string;
  categoryName: string;
  brandName: string;
  name: string;
  trackingType: TrackingType;
  model?: string | null;
  color?: string | null;
  ram?: string | null;
  storage?: string | null;
  sku?: string | null;
  barcode?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  defaultPurchasePrice: number;
  defaultSellingPrice: number;
  lowStockThreshold: number;
  isActive: boolean;
  isPublished: boolean;
  publicDescription?: string | null;
  contactForPrice: boolean;
  ptaStatus?: PtaStatus | null;
  quantityOnHand: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributes {
  model?: string | null;
  color?: string | null;
  ram?: string | null;
  storage?: string | null;
  sku?: string | null;
  barcode?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  defaultPurchasePrice?: number;
  defaultSellingPrice?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
}

export interface CreateProductInput extends ProductAttributes {
  name: string;
  categoryId: string;
  brandId: string;
  trackingType: TrackingType;
}

export interface UpdateProductInput extends Partial<ProductAttributes> {
  name?: string;
  categoryId?: string;
  brandId?: string;
  trackingType?: TrackingType;
  isPublished?: boolean;
  publicDescription?: string | null;
  contactForPrice?: boolean;
  ptaStatus?: PtaStatus | null;
}

export interface ProductListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  trackingType?: TrackingType | string;
  isActive?: 'true' | 'false' | boolean | string;
}

export * from '@/types/supplier-payment';
export * from '@/types/expense';
export * from '@/types/cash';

export interface RouteIdParams {
  id: string;
}

export interface RouteSupplierIdParams {
  supplierId: string;
}

export interface RouteProductImageParams {
  id: string;
  imageId: string;
}

export interface RouteIdContext {
  params: Promise<RouteIdParams>;
}

export interface RouteSupplierIdContext {
  params: Promise<RouteSupplierIdParams>;
}

export interface RouteProductImageContext {
  params: Promise<RouteProductImageParams>;
}

export interface RouteUserIdContext {
  params: Promise<{ id: string }>;
}

export interface ProxyErrorResult {
  handled: boolean;
  data?: unknown;
  status?: number;
}

export interface PaginatedListPayload<T> {
  items?: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

export interface UpstreamErrorBody {
  message?: string | string[];
  error?: string;
  [key: string]: unknown;
}

export interface ProxyOptions {
  method?: string;
  allowedParams?: string[];
  paramAliases?: Record<string, string>;
  body?: unknown;
  statusOnSuccess?: number;
  forwardFormData?: boolean;
  transformResponse?: (data: unknown) => unknown;
  transformError?: (errorBody: unknown, status: number) => ProxyErrorResult | undefined;
}

export interface ApiResponseBodyError {
  error?: string;
  message?: string | string[];
}
