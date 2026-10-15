'use client';

import { ErrorView } from '@/components/common/error-view';
import type { AppErrorProps } from '@/types/pages';
export type { AppErrorProps };

export default function AppError({ error, reset }: AppErrorProps) {
  return <ErrorView error={error} reset={reset} />;
}
