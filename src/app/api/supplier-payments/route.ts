import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import type { SupplierPaymentDTO } from '@/types/supplier-payment';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

/**
 * GET /api/supplier-payments
 * Proxies to GET /supplier-payments on the NestJS backend.
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

  const purchaseId = searchParams.get('purchaseId');
  if (purchaseId) params.set('purchaseId', purchaseId);

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
    const upstream = await fetch(`${BACKEND}/supplier-payments${qs}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store'
    });

    const body = (await upstream.json()) as {
      data?: { items?: SupplierPaymentDTO[]; total?: number; page?: number; pageSize?: number };
      items?: SupplierPaymentDTO[];
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
    let items: SupplierPaymentDTO[] = payload.items ?? [];

    if (sortBy === 'supplierName') {
      items = [...items].sort((a, b) => {
        const nameA = (a.supplierName || '').toLowerCase();
        const nameB = (b.supplierName || '').toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    } else if (sortBy === 'purchaseNo') {
      items = [...items].sort((a, b) => {
        const pA = (a.purchaseNo || '').toLowerCase();
        const pB = (b.purchaseNo || '').toLowerCase();
        return sortOrder === 'asc' ? pA.localeCompare(pB) : pB.localeCompare(pA);
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
      { error: error instanceof Error ? error.message : 'Failed to fetch supplier payments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/supplier-payments
 * Proxies to POST /supplier-payments on the NestJS backend (pays a supplier).
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const upstream = await fetch(`${BACKEND}/supplier-payments`, {
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
      { error: error instanceof Error ? error.message : 'Failed to record supplier payment' },
      { status: 500 }
    );
  }
}
