import { ApiError } from '@/lib/api/types';
import { APP_BASE_URL } from '@/constants/api';

export async function appFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${APP_BASE_URL}${path}`;
  const res = await fetch(url, { ...init, cache: 'no-store' });

  const text = await res.text();
  let body: (T & { error?: string; message?: string | string[] }) | null = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    const rawMessage =
      body?.message ?? body?.error ?? (text || `Request failed with status ${res.status}`);
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : String(rawMessage);
    throw new ApiError(res.status, message);
  }

  return (body ?? ({} as T)) as T;
}
