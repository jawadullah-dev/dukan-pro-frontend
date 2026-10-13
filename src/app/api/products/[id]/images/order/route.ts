import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

import { backendApiUrl } from '@/lib/dukaan/backend-api';

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const response = await fetch(`${backendApiUrl}/products/${id}/images/order`, {
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

  return NextResponse.json(responseBody, { status: response.status });
}
