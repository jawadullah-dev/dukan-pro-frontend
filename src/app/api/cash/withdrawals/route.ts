import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

/**
 * POST /api/cash/withdrawals
 * Proxies to POST /cash/withdrawals on the NestJS backend.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const upstream = await fetch(`${BACKEND}/cash/withdrawals`, {
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
      { error: error instanceof Error ? error.message : 'Failed to record owner withdrawal' },
      { status: 500 }
    );
  }
}
