import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

/**
 * GET /api/payments
 * Proxies to GET /payments on the NestJS backend.
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

  const customerId = searchParams.get('customerId');
  if (customerId) params.set('customerId', customerId);

  const saleId = searchParams.get('saleId');
  if (saleId) params.set('saleId', saleId);

  const receiptGroupId = searchParams.get('receiptGroupId');
  if (receiptGroupId) params.set('receiptGroupId', receiptGroupId);

  const status = searchParams.get('status');
  if (status) params.set('status', status);

  const from = searchParams.get('from');
  if (from) params.set('from', from);

  const to = searchParams.get('to');
  if (to) params.set('to', to);

  const sortBy = searchParams.get('sortBy');
  if (sortBy && ['paymentDate', 'amount', 'createdAt', 'updatedAt'].includes(sortBy)) {
    params.set('sortBy', sortBy);
  }

  const sortOrder = searchParams.get('sortOrder');
  if (sortOrder === 'asc' || sortOrder === 'desc') {
    params.set('sortOrder', sortOrder);
  }

  const qs = params.toString() ? `?${params.toString()}` : '';

  try {
    const upstream = await fetch(`${BACKEND}/payments${qs}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store'
    });

    const body = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(body, { status: upstream.status });
    }

    const payload = body.data !== undefined ? body.data : body;
    let items = payload.items ?? [];

    if (sortBy === 'customerName') {
      items = [...items].sort((a: any, b: any) => {
        const nameA = (a.customerName || 'Walk-in').toLowerCase();
        const nameB = (b.customerName || 'Walk-in').toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    } else if (sortBy === 'method') {
      const getMethod = (item: any) => {
        const match = item.notes?.match(/\[Method:\s*([^\]]+)\]/i);
        if (match && match[1]) return match[1].toLowerCase();
        return (item.method || 'cash').toLowerCase();
      };
      items = [...items].sort((a: any, b: any) => {
        const mA = getMethod(a);
        const mB = getMethod(b);
        return sortOrder === 'asc' ? mA.localeCompare(mB) : mB.localeCompare(mA);
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
      { error: error instanceof Error ? error.message : 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments
 * Proxies to POST /payments on the NestJS backend (records a customer payment against Udhar).
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Map payment method for upstream NestJS backend compatibility:
    // If the user recorded payment via JazzCash, EasyPaisa, or Bank Transfer,
    // record the method in the notes and pass 'CASH' upstream so NestJS @IsIn(['CASH']) validation succeeds.
    let upstreamNotes = body.notes;
    let upstreamMethod = body.method;

    if (body.method && body.method !== 'CASH') {
      const methodLabels: Record<string, string> = {
        JAZZCASH: 'JazzCash',
        EASYPAISA: 'EasyPaisa',
        BANK: 'Bank Transfer',
        BANK_TRANSFER: 'Bank Transfer'
      };
      const label = methodLabels[body.method] ?? body.method;
      upstreamNotes = upstreamNotes ? `[Method: ${label}] ${upstreamNotes}` : `[Method: ${label}]`;
      upstreamMethod = 'CASH';
    }

    const payload = {
      ...body,
      method: upstreamMethod,
      ...(upstreamNotes !== undefined ? { notes: upstreamNotes } : {})
    };

    const upstream = await fetch(`${BACKEND}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
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
      { error: error instanceof Error ? error.message : 'Failed to record payment' },
      { status: 500 }
    );
  }
}
