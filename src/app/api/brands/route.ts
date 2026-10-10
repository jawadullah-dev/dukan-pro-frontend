import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * GET /api/brands
 *
 * Proxies to GET /brands on the NestJS backend.
 * The backend JWT is read from the NextAuth session (server-side only)
 * and forwarded as Authorization: Bearer. The browser never sees the token.
 *
 * Supported query params forwarded to the backend:
 *   page, pageSize, search
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Forward only the params the backend understands.
  const { searchParams } = request.nextUrl;
  const params = new URLSearchParams();
  for (const key of ['page', 'pageSize', 'search']) {
    const val = searchParams.get(key);
    if (val) params.set(key, val);
  }

  const upstream = await fetch(`${BACKEND}/brands?${params.toString()}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    // Do not cache — brands change on mutation.
    cache: 'no-store'
  });

  const body = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(body, { status: upstream.status });
  }

  // Unwrap NestJS envelope { message, data: { items, total, page, pageSize } }
  return NextResponse.json(body.data, { status: 200 });
}

/**
 * POST /api/brands
 *
 * Proxies to POST /brands on the NestJS backend.
 * Body: { name: string }
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const upstream = await fetch(`${BACKEND}/brands`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    cache: 'no-store'
  });

  const responseBody = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(responseBody, { status: upstream.status });
  }

  // Unwrap envelope and return the created brand.
  return NextResponse.json(responseBody.data, { status: 201 });
}
