import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

/**
 * GET /api/inventory/adjustments
 * Proxies to GET /inventory/adjustments on NestJS backend.
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

  const pageSize =
    searchParams.get('pageSize') ?? searchParams.get('limit') ?? searchParams.get('perPage');
  if (pageSize) params.set('pageSize', pageSize);

  const search = searchParams.get('search');
  if (search) params.set('search', search);

  const productId = searchParams.get('productId');
  if (productId) params.set('productId', productId);

  const type = searchParams.get('type');
  if (type) params.set('type', type);

  const from = searchParams.get('from');
  if (from) params.set('from', from);

  const to = searchParams.get('to');
  if (to) params.set('to', to);

  const sortBy = searchParams.get('sortBy');
  if (sortBy) params.set('sortBy', sortBy);

  const sortOrder = searchParams.get('sortOrder');
  if (sortOrder === 'asc' || sortOrder === 'desc') params.set('sortOrder', sortOrder);

  const qs = params.toString() ? `?${params.toString()}` : '';

  try {
    const upstream = await fetch(`${BACKEND}/inventory/adjustments${qs}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store'
    });

    const body = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(body, { status: upstream.status });
    }

    return NextResponse.json(body.data !== undefined ? body.data : body, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch inventory adjustments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory/adjustments
 * Proxies to POST /inventory/adjustments on NestJS backend.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const upstream = await fetch(`${BACKEND}/inventory/adjustments`, {
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

    return NextResponse.json(responseBody.data !== undefined ? responseBody.data : responseBody, {
      status: upstream.status
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create inventory adjustment' },
      { status: 500 }
    );
  }
}
