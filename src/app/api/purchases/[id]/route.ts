import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/purchases/[id]
 * Proxies to GET /purchases/:id on the NestJS backend.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const upstream = await fetch(`${BACKEND}/purchases/${id}`, {
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
      { error: error instanceof Error ? error.message : 'Failed to fetch purchase' },
      { status: 500 }
    );
  }
}
