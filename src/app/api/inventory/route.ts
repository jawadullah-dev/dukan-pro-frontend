import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

/**
 * GET /api/inventory
 * Proxies to GET /reports/inventory on the NestJS backend.
 * Provides stock levels, tracking types, in-stock quantities, stock value (paisa),
 * low stock status, and serial numbers/IMEIs.
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

  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');
  if (sortBy) params.set('sortBy', sortBy);
  if (sortOrder === 'asc' || sortOrder === 'desc') params.set('sortOrder', sortOrder);

  const trackingType = searchParams.get('trackingType') ?? searchParams.get('tracking_type');
  const lowStock = searchParams.get('lowStock') ?? searchParams.get('low_stock');

  const qs = params.toString() ? `?${params.toString()}` : '';

  try {
    const upstream = await fetch(`${BACKEND}/reports/inventory${qs}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store'
    });

    const body = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(body, { status: upstream.status });
    }

    const payload = body.data !== undefined ? body.data : body;
    let items = Array.isArray(payload?.items) ? [...payload.items] : [];

    // Optional client-side facet filtering for trackingType and lowStock if passed
    if (trackingType) {
      const types = trackingType.split(',');
      items = items.filter((item) => types.includes(item.trackingType));
    }

    if (lowStock !== null && lowStock !== undefined && lowStock !== '') {
      const isLow = lowStock === 'true';
      items = items.filter((item) => item.lowStock === isLow);
    }

    return NextResponse.json(
      {
        ...payload,
        items,
        total: payload.total ?? items.length
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch inventory report' },
      { status: 500 }
    );
  }
}
