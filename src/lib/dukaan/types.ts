export type ShopStatus = 'ACTIVE' | 'SUSPENDED';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type UserRole = 'OWNER' | 'ADMIN';
export type TrackingType = 'SERIALIZED' | 'QUANTITY';
export type RecordStatus = 'ACTIVE' | 'CANCELLED';
export type InventoryUnitStatus = 'IN_STOCK' | 'SOLD' | 'DAMAGED' | 'LOST' | 'VOIDED';
export type InventoryCondition = 'NEW' | 'USED';
export type CashDirection = 'IN' | 'OUT';
export type PaymentMethod = 'CASH' | 'BANK' | 'MOBILE_WALLET';

export type CashMovementType =
  | 'OPENING_CASH'
  | 'CUSTOMER_PAYMENT'
  | 'SUPPLIER_PAYMENT'
  | 'EXPENSE'
  | 'REVERSAL'
  | 'OWNER_INVESTMENT'
  | 'OWNER_WITHDRAWAL'
  | 'REFUND'
  | 'RECONCILIATION_ADJUSTMENT';

export type InventoryMovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'ADJUSTMENT'
  | 'DAMAGED'
  | 'LOST'
  | 'SALE_CANCEL'
  | 'PURCHASE_CANCEL'
  | 'CUSTOMER_RETURN';

export interface Shop {
  id: string;
  name: string;
  phone: string;
  address: string;
  status: ShopStatus;
  subscription_ends_at: string;
  next_sale_no: number;
  next_purchase_no: number;
  created_at: string;
}

export interface User {
  id: string;
  shop_id: string;
  name: string;
  phone: string;
  password_hash?: string;
  password_setup_token_hash?: string;
  password_setup_expires_at?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface Category {
  id: string;
  shop_id: string;
  name: string;
  is_active: boolean;
}

export interface Brand {
  id: string;
  shop_id: string;
  name: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  shop_id: string;
  category_id: string;
  brand_id: string;
  name: string;
  model?: string;
  color?: string;
  ram?: string;
  storage?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  image_url?: string;
  tracking_type: TrackingType;
  default_purchase_price: number;
  default_selling_price: number;
  low_stock_threshold: number;
  is_active: boolean;
  created_at: string;
}

export interface StockLevel {
  id: string;
  shop_id: string;
  product_id: string;
  quantity_on_hand: number;
  avg_unit_cost: number;
}

export interface Supplier {
  id: string;
  shop_id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  opening_balance: number;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  opening_balance: number;
  is_active: boolean;
  created_at: string;
}

export interface Purchase {
  id: string;
  shop_id: string;
  supplier_id: string;
  purchase_no: string;
  supplier_invoice_ref?: string;
  purchase_date: string;
  total_amount: number;
  status: RecordStatus;
  is_opening_stock: boolean;
  client_request_id: string;
  cancelled_at?: string;
  cancel_reason?: string;
  created_at: string;
}

export interface PurchaseItem {
  id: string;
  shop_id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface InventoryUnit {
  id: string;
  shop_id: string;
  product_id: string;
  purchase_item_id?: string;
  imei1: string;
  imei2?: string;
  condition: InventoryCondition;
  unit_cost: number;
  status: InventoryUnitStatus;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  shop_id: string;
  product_id: string;
  inventory_unit_id?: string;
  type: InventoryMovementType;
  quantity_change: number;
  reason?: string;
  reference_type?: string;
  reference_id?: string;
  created_at: string;
}

export interface SupplierPayment {
  id: string;
  shop_id: string;
  supplier_id: string;
  purchase_id?: string;
  amount: number;
  payment_date: string;
  notes?: string;
  status: RecordStatus;
  client_request_id: string;
  cancelled_at?: string;
  cancel_reason?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  shop_id: string;
  customer_id?: string;
  sale_no: string;
  sale_date: string;
  subtotal: number;
  discount: number;
  total_amount: number;
  due_date?: string;
  status: RecordStatus;
  client_request_id: string;
  cancelled_at?: string;
  cancel_reason?: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  shop_id: string;
  sale_id: string;
  product_id: string;
  inventory_unit_id?: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total: number;
}

export interface Payment {
  id: string;
  shop_id: string;
  customer_id?: string;
  sale_id?: string;
  amount: number;
  method: PaymentMethod;
  receipt_group_id: string;
  status: RecordStatus;
  client_request_id: string;
  cancelled_at?: string;
  cancel_reason?: string;
  created_at: string;
}

export interface ExpenseCategory {
  id: string;
  shop_id: string;
  name: string;
  is_active: boolean;
}

export interface Expense {
  id: string;
  shop_id: string;
  category_id: string;
  amount: number;
  expense_date: string;
  description?: string;
  status: RecordStatus;
  cancelled_at?: string;
  cancel_reason?: string;
  created_at: string;
}

export interface CashMovement {
  id: string;
  shop_id: string;
  type: CashMovementType;
  direction: CashDirection;
  amount: number;
  is_overdraft: boolean;
  reverses_movement_id?: string;
  reference_type?: string;
  reference_id?: string;
  note?: string;
  created_at: string;
}

export interface DukaanStore {
  shops: Shop[];
  users: User[];
  categories: Category[];
  brands: Brand[];
  products: Product[];
  stock_levels: StockLevel[];
  suppliers: Supplier[];
  customers: Customer[];
  purchases: Purchase[];
  purchase_items: PurchaseItem[];
  inventory_units: InventoryUnit[];
  inventory_movements: InventoryMovement[];
  supplier_payments: SupplierPayment[];
  sales: Sale[];
  sale_items: SaleItem[];
  payments: Payment[];
  expense_categories: ExpenseCategory[];
  expenses: Expense[];
  cash_movements: CashMovement[];
  /** idempotency map: client_request_id -> entity type + id */
  request_index: Record<string, { type: string; id: string }>;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
  /** JSON string of TanStack sorting state, e.g. `[{"id":"name","desc":false}]` */
  sort?: string;
  /** Comma-separated values from table faceted filters */
  status?: string;
  category_id?: string;
  brand_id?: string;
  tracking_type?: string;
  type?: string;
  direction?: string;
  method?: string;
  low_stock?: string;
  is_active?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SoftCashWarning {
  needs_confirm: boolean;
  current_cash: number;
  amount: number;
  projected_cash: number;
}

export interface DashboardKpis {
  today_sales: number;
  today_net_profit: number;
  customer_udhar: number;
  supplier_payable: number;
  today_expenses: number;
  low_stock_count: number;
  cash_position: number;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'OPENING' | 'SALE' | 'PAYMENT' | 'CANCELLED_SALE' | 'CANCELLED_PAYMENT';
  label: string;
  amount: number;
  running_balance: number;
  reference_id?: string;
}
