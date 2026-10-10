import { ApiError, type ApiErrorBody, type ApiSuccessResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
  token?: string
): Promise<T> {
  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = new Headers(options?.headers);

  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const body = (await response.json().catch(() => null)) as
    | (ApiSuccessResponse<T> & ApiErrorBody)
    | null;

  if (!response.ok) {
    const rawMessage = body?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : typeof rawMessage === 'string'
        ? rawMessage
        : response.statusText || 'An error occurred';
    throw new ApiError(response.status, message, body ?? undefined);
  }

  // Backend wraps response in ApiSuccessResponseDTO { message, data }
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T;
  }

  return body as unknown as T;
}

export * from './types';
