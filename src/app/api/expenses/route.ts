import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import type { ExpenseDTO } from '@/types/expense';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

/**
 * GET /api/expenses
 * Proxies to GET /expenses on the NestJS backend.
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

  const categoryId = searchParams.get('categoryId');
  if (categoryId) params.set('categoryId', categoryId);

  const status = searchParams.get('status');
  if (status) params.set('status', status);

  const from = searchParams.get('from');
  if (from) params.set('from', from);

  const to = searchParams.get('to');
  if (to) params.set('to', to);

  const sortBy = searchParams.get('sortBy');
  if (sortBy && ['expenseDate', 'amount', 'createdAt'].includes(sortBy)) {
    params.set('sortBy', sortBy);
  }

  const sortOrder = searchParams.get('sortOrder');
  if (sortOrder === 'asc' || sortOrder === 'desc') {
    params.set('sortOrder', sortOrder);
  }

  const qs = params.toString() ? `?${params.toString()}` : '';

  try {
    const upstream = await fetch(`${BACKEND}/expenses${qs}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store'
    });

    const body = (await upstream.json()) as {
      data?: { items?: ExpenseDTO[]; total?: number; page?: number; pageSize?: number };
      items?: ExpenseDTO[];
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
    let items: ExpenseDTO[] = payload.items ?? [];

    if (sortBy === 'categoryName') {
      items = [...items].sort((a, b) => {
        const cA = (a.categoryName || '').toLowerCase();
        const cB = (b.categoryName || '').toLowerCase();
        return sortOrder === 'asc' ? cA.localeCompare(cB) : cB.localeCompare(cA);
      });
    } else if (sortBy === 'description') {
      items = [...items].sort((a, b) => {
        const dA = (a.description || '').toLowerCase();
        const dB = (b.description || '').toLowerCase();
        return sortOrder === 'asc' ? dA.localeCompare(dB) : dB.localeCompare(dA);
      });
    } else if (sortBy === 'status') {
      items = [...items].sort((a, b) => {
        return sortOrder === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      });
    }

    return NextResponse.json(
      {
        items,
        total: payload.total ?? 0,
        page: payload.page ?? 1,
        pageSize: payload.pageSize ?? 20
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/expenses
 * Proxies to POST /expenses on the NestJS backend (records an operating expense).
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const upstream = await fetch(`${BACKEND}/expenses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    const responseBody = (await upstream.json()) as {
      data?: {
        status?: boolean;
        message?: string;
        confirmOverdraft?: boolean;
        shortfall?: number;
      };
      status?: boolean;
      message?: string;
      confirmOverdraft?: boolean;
      shortfall?: number;
      error?: string;
    };

    if (!upstream.ok) {
      return NextResponse.json(responseBody, { status: upstream.status });
    }

    return NextResponse.json(responseBody.data !== undefined ? responseBody.data : responseBody, {
      status: upstream.status
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record expense' },
      { status: 500 }
    );
  }
}
