import type { ReactNode } from 'react';

export interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return <div className='container mx-auto flex flex-col gap-6 p-4 md:p-6'>{children}</div>;
}
