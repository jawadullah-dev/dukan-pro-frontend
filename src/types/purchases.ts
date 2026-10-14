import type { ReactNode } from 'react';
import type { PurchaseDTO } from '@/lib/api/types';
import type { Product } from '@/lib/dukaan/types';

export interface CancelPurchaseDialogProps {
  purchase: PurchaseDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface PurchaseLineItem {
  product_id: string;
  quantity: number;
  unit_cost: number;
  imeis_text: string;
  imei2_text: string;
  condition: 'NEW' | 'USED';
  tracking_type?: Product['tracking_type'];
}

export interface PurchaseFormValues {
  supplier_id: string;
  supplier_invoice_ref: string;
  is_opening_stock: boolean;
  paid_now: number;
  lines: PurchaseLineItem[];
}

export type PurchaseLineDraft = {
  product_id: string;
  quantity: number;
  unit_cost: number;
  imeis_text: string;
  imei2_text: string;
  condition: 'NEW' | 'USED';
  tracking_type?: Product['tracking_type'];
};

export interface PurchaseCreateFormProps {
  onDone?: () => void;
}

export interface PurchaseCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clearDefaultQuery?: boolean;
}

export interface PurchaseDetailClientProps {
  id: string;
}

export interface PurchaseRowActionsProps {
  purchase: PurchaseDTO;
}

export interface PurchasesTableProps {
  toolbarAction?: ReactNode;
}

export interface PurchasesHeaderActionProps {
  className?: string;
  onAdd: () => void;
}

export interface PurchasesListClientProps {
  defaultOpenAdd?: boolean;
}
