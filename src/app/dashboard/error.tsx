'use client';

import { ErrorView } from '@/components/common/error-view';
import type { DashboardErrorProps } from '@/types/pages';
export type { DashboardErrorProps };

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return <ErrorView error={error} reset={reset} />;
}
