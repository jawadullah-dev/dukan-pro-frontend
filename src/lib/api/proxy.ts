import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/constants/api';

export interface RouteIdContext {
  params: Promise<{ id: string }>;
}

export interface RouteSupplierIdContext {
  params: Promise<{ supplierId: string }>;
}

export interface RouteProductImageContext {
  params: Promise<{ id: string; imageId: string }>;
}

export interface ProxyErrorResult {
  handled: boolean;
  data?: unknown;
  status?: number;
}

export interface PaginatedListPayload<T> {
  items?: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

export interface UpstreamErrorBody {
  message?: string | string[];
  error?: string;
  [key: string]: unknown;
}

export function isCancelledStatusError(errorBody: unknown, status: number): boolean {
  if (status !== 400) return false;
  const body = errorBody as UpstreamErrorBody | null;
  const rawMsg = Array.isArray(body?.message)
    ? body.message.join(' ')
    : body?.message || body?.error || '';
  return rawMsg.includes('CANCELLED status') || rawMsg.includes('Cannot modify a cancelled');
}

export interface ProxyOptions {
  method?: string;
  allowedParams?: string[];
  paramAliases?: Record<string, string>;
  body?: unknown;
  statusOnSuccess?: number;
  forwardFormData?: boolean;
  transformResponse?: (data: unknown) => unknown;
  transformError?: (errorBody: unknown, status: number) => ProxyErrorResult | undefined;
}

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
  options?: ProxyOptions
): Promise<NextResponse> {
  const session = await auth();
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let qs = '';
  if (options?.allowedParams) {
    const searchParams = request.nextUrl.searchParams;
    const params = new URLSearchParams();
    const aliases = {
      ...(options.allowedParams.includes('pageSize')
        ? { limit: 'pageSize', perPage: 'pageSize' }
        : {}),
      ...options?.paramAliases
    };

    for (const key of options.allowedParams) {
      let val = searchParams.get(key);
      if (val == null) {
        for (const [alias, target] of Object.entries(aliases)) {
          if (target === key) {
            val = searchParams.get(alias);
            if (val != null) break;
          }
        }
      }
      if (val != null) params.set(key, val);
    }
    const str = params.toString();
    if (str) qs = `?${str}`;
  } else if (request.nextUrl.search) {
    qs = request.nextUrl.search;
  }

  const method = options?.method ?? request.method;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json'
  };

  let reqBody: BodyInit | undefined;
  if (options?.forwardFormData) {
    reqBody = await request.formData();
  } else if (method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
    if (options?.body !== undefined) {
      reqBody = JSON.stringify(options.body);
    } else {
      const json = await request.json().catch(() => null);
      if (json !== null) {
        reqBody = JSON.stringify(json);
      }
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${backendPath}${qs}`, {
      method,
      headers,
      body: reqBody,
      cache: 'no-store'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Backend unreachable' },
      { status: 502 }
    );
  }

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    if (options?.transformError) {
      const transformed = options.transformError(responseBody, response.status);
      if (transformed?.handled) {
        return NextResponse.json(transformed.data, {
          status: transformed.status ?? 200
        });
      }
    }
    return NextResponse.json(responseBody ?? { error: 'Upstream error' }, {
      status: response.status
    });
  }

  const defaultStatus = method === 'POST' ? 201 : 200;
  const status = options?.statusOnSuccess ?? defaultStatus;
  if (status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const unwrapped =
    responseBody && typeof responseBody === 'object' && 'data' in responseBody
      ? responseBody.data
      : responseBody;

  const finalPayload = options?.transformResponse
    ? options.transformResponse(unwrapped)
    : unwrapped;

  return NextResponse.json(finalPayload, { status });
}
