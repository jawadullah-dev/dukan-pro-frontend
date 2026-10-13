import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

import { backendApiUrl } from '@/lib/dukaan/backend-api';

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch(`${backendApiUrl}/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    cache: 'no-store'
  });

  const body = await response.json();

  if (!response.ok) {
    return NextResponse.json(body, { status: response.status });
  }

  return NextResponse.json(body.data ?? body, { status: response.status });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const response = await fetch(`${backendApiUrl}/products/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  });

  const responseBody = await response.json();

  if (!response.ok) {
    return NextResponse.json(responseBody, { status: response.status });
  }

  return NextResponse.json(responseBody.data ?? responseBody, { status: response.status });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch(`${backendApiUrl}/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  const responseBody = await response.json();

  if (!response.ok) {
    return NextResponse.json(responseBody, { status: response.status });
  }

  return NextResponse.json(responseBody.data ?? responseBody, { status: response.status });
}
