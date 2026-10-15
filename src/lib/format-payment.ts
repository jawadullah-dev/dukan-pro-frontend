export function formatPaymentMethod(method?: string | null, notes?: string | null): string {
  const match = notes?.match(/\[Method:\s*([^\]]+)\]/i);
  if (match && match[1]) {
    return match[1];
  }
  if (!method) return 'Cash';
  const upper = method.toUpperCase();
  if (upper === 'CASH') return 'Cash';
  if (upper === 'JAZZCASH') return 'JazzCash';
  if (upper === 'EASYPAISA') return 'EasyPaisa';
  if (upper === 'BANK' || upper === 'BANK_TRANSFER') return 'Bank Transfer';
  return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
}
