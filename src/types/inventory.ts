import type { ReactNode } from 'react';
import type { InventoryItemDTO } from '@/lib/api/types';

export interface AdjustmentsTableProps {
  toolbarAction?: ReactNode;
}

export interface InventoryRowActionsProps {
  item: InventoryItemDTO;
  onAdjust: (item: InventoryItemDTO) => void;
}

export interface InventoryTableProps {
  toolbarAction?: ReactNode;
}

export interface StockAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProduct?: InventoryItemDTO | null;
}
