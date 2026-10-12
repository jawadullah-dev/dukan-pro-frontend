import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const params = new URLSearchParams();
  for (const key of ['page', 'pageSize', 'search']) {
    const val = searchParams.get(key);
    if (val) params.set(key, val);
  }

  const upstream = await fetch(`${BACKEND}/categories?${params.toString()}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: 'no-store'
  });

  const body = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(body, { status: upstream.status });
  }

  return NextResponse.json(body.data, { status: 200 });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const upstream = await fetch(`${BACKEND}/categories`, {
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

  return NextResponse.json(responseBody.data, { status: 201 });
}
