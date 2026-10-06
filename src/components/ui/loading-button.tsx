'use client';

import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';

export interface LoadingButtonProps extends ButtonProps {
  /** Alias for Button `isLoading` — kept for existing call sites. */
  loading?: boolean;
  /** Polite screen-reader announcement while loading. */
  loadingLabel?: string;
}

/**
 * Thin wrapper around Button `isLoading`. Prefer `<Button isLoading={…}>`
 * for new code; this stays for forms / older call sites.
 */
export function LoadingButton({
  loading = false,
  isLoading,
  loadingLabel = 'Loading…',
  children,
  ...props
}: LoadingButtonProps) {
  const busy = isLoading || loading;
  return (
    <>
      <Button {...props} isLoading={busy}>
        {children}
      </Button>
      <span role='status' aria-live='polite' className='sr-only'>
        {busy ? loadingLabel : ''}
      </span>
    </>
  );
}
