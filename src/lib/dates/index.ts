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
