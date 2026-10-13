import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

import { backendApiUrl } from '@/lib/dukaan/backend-api';

export async function GET(request: NextRequest) {
  const session = await auth();
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const params = new URLSearchParams();
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');
  const limit = searchParams.get('limit');
  const search = searchParams.get('search');
  const categoryId = searchParams.get('categoryId');
  const brandId = searchParams.get('brandId');
  const trackingType = searchParams.get('trackingType');
  const isActive = searchParams.get('isActive');

  params.set('page', page ?? '1');
  params.set('pageSize', pageSize ?? limit ?? '10');

  if (search) params.set('search', search);
  if (categoryId) params.set('categoryId', categoryId);
  if (brandId) params.set('brandId', brandId);
  if (trackingType) params.set('trackingType', trackingType);
  if (isActive) params.set('isActive', isActive);

  const response = await fetch(`${backendApiUrl}/products?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    cache: 'no-store'
  });

  const responseBody = await response.json();

  if (!response.ok) {
    return NextResponse.json(responseBody, { status: response.status });
  }

  return NextResponse.json(responseBody.data ?? responseBody, { status: response.status });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const response = await fetch(`${backendApiUrl}/products`, {
    method: 'POST',
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
