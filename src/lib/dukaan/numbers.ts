export * from '@/lib/money';
export * from '@/lib/dates';

export function formatLabel(value: string): string {
  return value.replaceAll('_', ' ').toLowerCase();
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function createClientRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
