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

  const response = await fetch(`${backendApiUrl}/products/${id}/images`, {
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

  return NextResponse.json(body, { status: response.status });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json(
      { message: 'Content-Type must be multipart/form-data' },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const response = await fetch(`${backendApiUrl}/products/${id}/images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const responseBody = await response.json();

  if (!response.ok) {
    return NextResponse.json(responseBody, { status: response.status });
  }

  return NextResponse.json(responseBody, { status: response.status });
}
