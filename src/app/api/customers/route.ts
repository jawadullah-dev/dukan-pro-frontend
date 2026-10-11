import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * GET /api/customers
 *
 * Proxies to GET /customers on the NestJS backend.
 * Uses session Bearer token from NextAuth.
 *
 * Query params forwarded:
 *   page, pageSize, search, isActive, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const params = new URLSearchParams();

  const page = searchParams.get('page');
  if (page) params.set('page', page);

  const pageSize = searchParams.get('pageSize');
  if (pageSize) params.set('pageSize', pageSize);

  const search = searchParams.get('search');
  if (search) params.set('search', search);

  const isActive = searchParams.get('isActive');
  if (isActive === 'true' || isActive === 'false') {
    params.set('isActive', isActive);
  }

  const sortBy = searchParams.get('sortBy');
  if (sortBy) params.set('sortBy', sortBy);

  const sortOrder = searchParams.get('sortOrder');
  if (sortOrder === 'asc' || sortOrder === 'desc') {
    params.set('sortOrder', sortOrder);
  }

  const upstream = await fetch(`${BACKEND}/customers?${params.toString()}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: 'no-store'
  });

  const body = await upstream.json();

  // Resilient fallback: if upstream is an older backend release that only allows
  // ['name', 'createdAt', 'updatedAt'] for sortBy, gracefully fall back to 'createdAt'
  // and sort the items in memory instead of failing with 400.
  if (
    !upstream.ok &&
    sortBy &&
    (sortBy === 'isActive' || sortBy === 'openingBalance' || sortBy === 'phone')
  ) {
    const fallbackParams = new URLSearchParams(params);
    fallbackParams.set('sortBy', 'createdAt');

    const fallbackUpstream = await fetch(`${BACKEND}/customers?${fallbackParams.toString()}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store'
    });

    if (fallbackUpstream.ok) {
      const fallbackBody = await fallbackUpstream.json();
      const items = [...(fallbackBody.data?.items ?? [])];

      if (sortBy === 'isActive') {
        items.sort((a: any, b: any) => {
          const valA = a.isActive ? 1 : 0;
          const valB = b.isActive ? 1 : 0;
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        });
      } else if (sortBy === 'openingBalance') {
        items.sort((a: any, b: any) => {
          const valA = Number(a.openingBalance ?? 0);
          const valB = Number(b.openingBalance ?? 0);
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        });
      } else if (sortBy === 'phone') {
        items.sort((a: any, b: any) => {
          const valA = (a.phone ?? '').toString();
          const valB = (b.phone ?? '').toString();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
      }

      return NextResponse.json(
        {
          ...fallbackBody.data,
          items
        },
        { status: 200 }
      );
    }
  }

  if (!upstream.ok) {
    return NextResponse.json(body, { status: upstream.status });
  }

  return NextResponse.json(body.data, { status: 200 });
}

/**
 * POST /api/customers
 *
 * Proxies to POST /customers on the NestJS backend.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const upstream = await fetch(`${BACKEND}/customers`, {
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

  return NextResponse.json(responseBody.data, { status: 201 });
}
