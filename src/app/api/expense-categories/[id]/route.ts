import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import type { ExpenseCategoryDTO } from '@/types/expense';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/expense-categories/[id]
 * Proxies to GET /expense-categories/:id on the NestJS backend.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const upstream = await fetch(`${BACKEND}/expense-categories/${id}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store'
    });

    const body = (await upstream.json()) as {
      data?: ExpenseCategoryDTO;
      error?: string;
      message?: string | string[];
    };

    if (!upstream.ok) {
      return NextResponse.json(body, { status: upstream.status });
    }

    return NextResponse.json(body.data !== undefined ? body.data : body, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch expense category' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/expense-categories/[id]
 * Proxies to PATCH /expense-categories/:id on the NestJS backend.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    const upstream = await fetch(`${BACKEND}/expense-categories/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    const responseBody = (await upstream.json()) as {
      data?: { status?: boolean; message?: string };
      status?: boolean;
      message?: string;
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
      { error: error instanceof Error ? error.message : 'Failed to update expense category' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/expense-categories/[id]
 * Proxies to DELETE /expense-categories/:id on the NestJS backend (deactivates the category).
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const upstream = await fetch(`${BACKEND}/expense-categories/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      },
      cache: 'no-store'
    });

    const responseBody = (await upstream.json()) as {
      data?: { status?: boolean; message?: string };
      status?: boolean;
      message?: string;
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
      { error: error instanceof Error ? error.message : 'Failed to deactivate expense category' },
      { status: 500 }
    );
  }
}
