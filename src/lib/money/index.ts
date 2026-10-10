export function formatSaleNo(n: number): string {
  return `S-${String(n).padStart(4, '0')}`;
}

export function formatPurchaseNo(n: number): string {
  return `P-${String(n).padStart(4, '0')}`;
}

export function toPaisa(rupees: number): number {
  return Math.round(rupees * 100);
}

export function fromPaisa(paisa: number): number {
  return paisa / 100;
}

export function formatPkr(paisa: number): string {
  return `Rs ${fromPaisa(paisa).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}
