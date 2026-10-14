import { fakeUsers } from '@/constants/mock-api-users';
import { NextRequest, NextResponse } from 'next/server';
import type { RouteUserIdContext } from '@/lib/api/types';

export async function PUT(request: NextRequest, { params }: RouteUserIdContext) {
  const { id } = await params;
  const body = await request.json();
  const data = await fakeUsers.updateUser(Number(id), body);

  if (!data.success) {
    return NextResponse.json(data, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: RouteUserIdContext) {
  const { id } = await params;
  const data = await fakeUsers.deleteUser(Number(id));

  if (!data.success) {
    return NextResponse.json(data, { status: 404 });
  }

  return NextResponse.json(data);
}
