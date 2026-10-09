export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('92') && digits.length >= 12) {
    digits = `0${digits.slice(2)}`;
  }

  return digits;
}

export function isValidPkMobile(phone: string): boolean {
  return /^03\d{9}$/.test(normalizePhone(phone));
}
