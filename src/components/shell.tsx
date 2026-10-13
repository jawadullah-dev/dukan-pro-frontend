import type { ReactNode } from 'react';

export function Shell({ children }: { children: ReactNode }) {
  return <div className='container mx-auto flex flex-col gap-6 p-4 md:p-6'>{children}</div>;
}
