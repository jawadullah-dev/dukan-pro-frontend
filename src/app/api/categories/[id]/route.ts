import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  const upstream = await fetch(`${BACKEND}/categories/${id}`, {
    method: 'PATCH',
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

  return NextResponse.json(responseBody.data, { status: 200 });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  const upstream = await fetch(`${BACKEND}/categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: 'no-store'
  });

  const responseBody = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(responseBody, { status: upstream.status });
  }

  return NextResponse.json(responseBody.data, { status: 200 });
}
