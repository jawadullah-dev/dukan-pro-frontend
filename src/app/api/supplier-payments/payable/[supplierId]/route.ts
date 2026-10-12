import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import type { SupplierPayableDTO } from '@/types/supplier-payment';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

interface RouteParams {
  params: Promise<{ supplierId: string }>;
}

/**
 * GET /api/supplier-payments/payable/[supplierId]
 * Proxies to GET /supplier-payments/payable/:supplierId on the NestJS backend.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { supplierId } = await params;

  try {
    const upstream = await fetch(`${BACKEND}/supplier-payments/payable/${supplierId}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store'
    });

    const body = (await upstream.json()) as {
      data?: SupplierPayableDTO;
      message?: string | string[];
      error?: string;
    };

    if (!upstream.ok) {
      return NextResponse.json(body, { status: upstream.status });
    }

    return NextResponse.json(body.data !== undefined ? body.data : body, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch supplier payable' },
      { status: 500 }
    );
  }
}
