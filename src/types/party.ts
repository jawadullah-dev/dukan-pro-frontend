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
