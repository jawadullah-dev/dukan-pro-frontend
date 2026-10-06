/** Normalize PK mobile input to `03XXXXXXXXX` digits. */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('92') && digits.length >= 12) {
    digits = `0${digits.slice(2)}`;
  }

  return digits;
}

/** Pakistani mobile: 03 followed by 9 digits (11 total). */
export function isValidPkMobile(phone: string): boolean {
  return /^03\d{9}$/.test(normalizePhone(phone));
}
