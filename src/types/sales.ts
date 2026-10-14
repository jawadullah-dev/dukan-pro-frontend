import type { ReactNode } from 'react';
import type { SaleDTO } from '@/lib/api/types';
import type { Product } from '@/lib/dukaan/types';

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
