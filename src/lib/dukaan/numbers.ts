export function formatSaleNo(n: number): string {
  return `S-${String(n).padStart(4, '0')}`;
}

export function formatPurchaseNo(n: number): string {
  return `P-${String(n).padStart(4, '0')}`;
}

export function formatLabel(value: string): string {
  return value.replaceAll('_', ' ').toLowerCase();
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

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${yyyy}-${mm}-${dd} ${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function createClientRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
