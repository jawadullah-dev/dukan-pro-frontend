export type CashMovementType =
  | 'OPENING_CASH'
  | 'CUSTOMER_PAYMENT'
  | 'SUPPLIER_PAYMENT'
  | 'EXPENSE'
  | 'REVERSAL'
  | 'REFUND'
  | 'OWNER_INVESTMENT'
  | 'OWNER_WITHDRAWAL'
  | 'RECONCILIATION_ADJUSTMENT';

export type CashDirection = 'IN' | 'OUT';

export interface CashMovementDTO {
  id: string;
  shopId: string;
  type: CashMovementType;
  direction: CashDirection;
  amount: number;
  movementDate: string;
  referenceType: string | null;
  referenceId: string | null;
  reversesMovementId: string | null;
  isOverdraft: boolean;
  note: string | null;
  createdById: string;
  createdAt: string;
}

export type CashMovementSortField = 'movementDate' | 'amount' | 'createdAt';

export interface CashMovementQueryFilter {
  page?: number;
  pageSize?: number;
  limit?: number;
  type?: CashMovementType;
  direction?: CashDirection;
  search?: string;
  from?: string;
  to?: string;
  sortBy?: CashMovementSortField;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateOpeningCashInput {
  amount: number;
  date?: string;
  notes?: string;
}

export interface CreateOwnerInvestmentInput {
  amount: number;
  date?: string;
  notes?: string;
}

export interface CreateOwnerWithdrawalInput {
  amount: number;
  date?: string;
  notes?: string;
  confirmOverdraft?: boolean;
}

export interface CashOverdraftPrompt {
  confirmOverdraft: true;
  shortfall: number;
  message: string;
}

export interface CashSuccessResult {
  status: boolean;
  message: string;
  confirmOverdraft?: false;
}

export type CreateOwnerWithdrawalResult = CashSuccessResult | CashOverdraftPrompt;

export interface CashStatusResult {
  status: boolean;
  message: string;
}

export interface CashTableProps {
  toolbarAction?: React.ReactNode;
}

export interface OpeningCashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface OwnerInvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface OwnerWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
