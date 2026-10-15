import type { ReactNode } from 'react';

export interface BasePartyRecord {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  openingBalance: number;
  isActive: boolean;
  createdAt: string;
}

export interface PartyDetailLabels {
  partyName: string;
  balance: string;
  openingBalance: string;
}

export interface BasePartyEntity {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  openingBalance: number;
  isSystem?: boolean;
}

export interface BasePartyPayload {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  openingBalance: number;
  isActive: boolean;
}

export interface BasePartyFormState {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  opening_balance: number;
}

export interface BasePartyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  party?: BasePartyEntity | null;
  titleAdd: string;
  titleEdit: string;
  descriptionAdd: string;
  descriptionEdit: string;
  openingBalanceLabel: string;
  namePlaceholder?: string;
  successCreated: string;
  successUpdated: string;
  primaryButtonMode?: 'add' | 'edit' | 'save';
  onSave: (payload: BasePartyPayload, id?: string) => Promise<unknown>;
  invalidateQueryKey: readonly unknown[];
  schema?: unknown;
}

export interface BasePartyDialogBodyProps extends BasePartyDialogProps {}

export interface PartyCellActionProps {
  id: string;
  isActive: boolean;
  isSystem?: boolean;
  ledgerHref?: string;
  deactivateTitle: string;
  deactivateDescription: string;
  deactivateConfirmLabel?: string;
  deactivateSuccess: string;
  activateSuccess: string;
  onDeactivate: (id: string) => Promise<unknown>;
  onActivate: (id: string) => Promise<unknown>;
  invalidateQueryKey: readonly unknown[];
  renderEditDialog: (open: boolean, onOpenChange: (open: boolean) => void) => ReactNode;
}
