import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/payments/[id]/cancel-impact
 * Proxies to GET /payments/:id/cancel-impact on the NestJS backend.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const upstream = await fetch(`${BACKEND}/payments/${id}/cancel-impact`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store'
    });

    const body = await upstream.json();

    if (!upstream.ok) {
      // Check if upstream returned that the payment is already cancelled
      const rawMsg = Array.isArray(body?.message)
        ? body.message.join(' ')
        : body?.message || body?.error || '';

      if (
        upstream.status === 400 &&
        (rawMsg.includes('CANCELLED status') || rawMsg.includes('Cannot modify a cancelled'))
      ) {
        return NextResponse.json(
          {
            recordType: 'PAYMENT',
            recordId: id,
            recordNo: null,
            currentCash: 0,
            cashReversedAmount: 0,
            cashReversedDirection: 'OUT',
            cashAfter: 0,
            willCauseOverdraft: false,
            customerUdharAfter: null,
            supplierPayableAfter: null,
            stockItems: [],
            blocked: true,
            blockedReason:
              'Payment is already in CANCELLED status and cannot be edited or cancelled again.'
          },
          { status: 200 }
        );
      }

      return NextResponse.json(body, { status: upstream.status });
    }

    return NextResponse.json(body.data !== undefined ? body.data : body, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch payment cancel impact' },
      { status: 500 }
    );
  }
}
