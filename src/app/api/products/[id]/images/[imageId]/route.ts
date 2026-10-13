import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

import { backendApiUrl } from '@/lib/dukaan/backend-api';

type Params = {
  params: Promise<{ id: string; imageId: string }>;
};

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id, imageId } = await params;
  const session = await auth();
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch(`${backendApiUrl}/products/${id}/images/${imageId}`, {
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

  return NextResponse.json(responseBody, { status: response.status });
}
