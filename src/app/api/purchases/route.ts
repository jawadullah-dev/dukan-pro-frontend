import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

/**
 * GET /api/purchases
 * Proxies to GET /purchases on the NestJS backend.
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

  const pageSize = searchParams.get('pageSize') ?? searchParams.get('limit');
  if (pageSize) params.set('pageSize', pageSize);

  const search = searchParams.get('search');
  if (search) params.set('search', search);

  const supplierId = searchParams.get('supplierId');
  if (supplierId) params.set('supplierId', supplierId);

  const status = searchParams.get('status');
  if (status) params.set('status', status);

  const isOpeningStock = searchParams.get('isOpeningStock');
  if (isOpeningStock !== null && isOpeningStock !== undefined && isOpeningStock !== '') {
    params.set('isOpeningStock', isOpeningStock);
  }

  const from = searchParams.get('from');
  if (from) params.set('from', from);

  const to = searchParams.get('to');
  if (to) params.set('to', to);

  const sortBy = searchParams.get('sortBy');
  const allowedBackendSorts = [
    'purchaseDate',
    'purchaseNo',
    'totalAmount',
    'createdAt',
    'updatedAt'
  ];
  if (sortBy && allowedBackendSorts.includes(sortBy)) {
    params.set('sortBy', sortBy);
  }

  const sortOrder = searchParams.get('sortOrder');
  if (sortOrder === 'asc' || sortOrder === 'desc') {
    params.set('sortOrder', sortOrder);
  }

  const qs = params.toString() ? `?${params.toString()}` : '';

  try {
    const upstream = await fetch(`${BACKEND}/purchases${qs}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store'
    });

    const body = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(body, { status: upstream.status });
    }

    const payload = body.data !== undefined ? body.data : body;
    let items = Array.isArray(payload?.items) ? [...payload.items] : [];

    if (sortBy === 'status') {
      items.sort((a, b) => {
        const sA = (a.status || '').toLowerCase();
        const sB = (b.status || '').toLowerCase();
        return sortOrder === 'desc' ? sB.localeCompare(sA) : sA.localeCompare(sB);
      });
    }

    return NextResponse.json({ ...payload, items }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/purchases
 * Proxies to POST /purchases on the NestJS backend.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const upstream = await fetch(`${BACKEND}/purchases`, {
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
      { error: error instanceof Error ? error.message : 'Failed to create purchase' },
      { status: 500 }
    );
  }
}
