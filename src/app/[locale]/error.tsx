'use client';

import { ErrorView } from '@/components/common/error-view';
import type { LocaleAppErrorProps } from '@/types';

export default function AppError({ error, reset }: LocaleAppErrorProps) {
  return <ErrorView error={error} reset={reset} />;
}
