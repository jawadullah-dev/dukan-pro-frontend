import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import type { CashMovementDTO } from '@/types/cash';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

/**
 * GET /api/cash/movements
 * Proxies to GET /cash/movements on the NestJS backend.
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

  const type = searchParams.get('type');
  if (type) params.set('type', type);

  const direction = searchParams.get('direction');
  if (direction) params.set('direction', direction);

  const search = searchParams.get('search');
  if (search) params.set('search', search);

  const from = searchParams.get('from');
  if (from) params.set('from', from);

  const to = searchParams.get('to');
  if (to) params.set('to', to);

  const sortBy = searchParams.get('sortBy');
  if (sortBy && ['movementDate', 'amount', 'createdAt'].includes(sortBy)) {
    params.set('sortBy', sortBy);
  }

  const sortOrder = searchParams.get('sortOrder');
  if (sortOrder === 'asc' || sortOrder === 'desc') {
    params.set('sortOrder', sortOrder);
  }

  const qs = params.toString() ? `?${params.toString()}` : '';

  try {
    const upstream = await fetch(`${BACKEND}/cash/movements${qs}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store'
    });

    const body = (await upstream.json()) as {
      data?: { items?: CashMovementDTO[]; total?: number; page?: number; pageSize?: number };
      items?: CashMovementDTO[];
      total?: number;
      page?: number;
      pageSize?: number;
      error?: string;
      message?: string | string[];
    };

    if (!upstream.ok) {
      return NextResponse.json(body, { status: upstream.status });
    }

    const payload = body.data !== undefined ? body.data : body;
    return NextResponse.json(
      {
        items: payload.items ?? [],
        total: payload.total ?? 0,
        page: payload.page ?? 1,
        pageSize: payload.pageSize ?? 10
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch cash movements' },
      { status: 500 }
    );
  }
}
