import type { ReactNode } from 'react';
import type {
  SaleDTO,
  SaleReturnDTO,
  CancelSaleInput,
  ReturnPreviewInput,
  CreateReturnInput
} from '@/lib/api/types';
import type { Product } from '@/lib/dukaan/types';

export interface SaleOverdraftPrompt {
  confirmOverdraft?: boolean;
  shortfall?: number;
  message?: string;
}

export type CancelSaleResult = SaleOverdraftPrompt | SaleDTO;
export type CreateReturnResult = SaleOverdraftPrompt | SaleReturnDTO;

export interface SalesListFilters {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  status?: 'ACTIVE' | 'CANCELLED';
  from?: string;
  to?: string;
  sortBy?: 'saleDate' | 'saleNo' | 'totalAmount' | 'paid' | 'status' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CancelSaleMutationVariables {
  id: string;
  input: CancelSaleInput;
}

export interface PreviewReturnMutationVariables {
  id: string;
  input: ReturnPreviewInput;
}

export interface CreateReturnMutationVariables {
  id: string;
  input: CreateReturnInput;
}

export interface CancelSaleDialogProps {
  sale: SaleDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface ReturnSaleDialogProps {
  sale: SaleDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface ItemReturnState {
  selected: boolean;
  quantity: number;
  condition: 'GOOD' | 'DAMAGED';
}

export interface SaleRowActionsProps {
  sale: SaleDTO;
}

export interface SalesTableProps {
  toolbarAction?: ReactNode;
}

export interface SaleCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clearDefaultQuery?: boolean;
}

export interface SalesHeaderActionProps {
  className?: string;
  onAdd: () => void;
}

export interface SalesListClientProps {
  defaultOpenAdd?: boolean;
}

export interface SaleLineItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  inventory_unit_id?: string;
  tracking_type?: Product['tracking_type'];
}

export interface SaleFormValues {
  customer_id: string;
  discount: number;
  paid_now: number;
  lines: SaleLineItem[];
  notes?: string;
}

export interface SaleFormSubmitContext {
  value: SaleFormValues;
}

export interface SaleCreateFormProps {
  onDone?: () => void;
}

export interface SaleDetailClientProps {
  id: string;
}

export interface SaleReceiptClientProps {
  id: string;
}
