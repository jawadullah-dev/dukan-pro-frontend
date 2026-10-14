import { auth } from '@/auth';
import { SHOP_HOME } from '@/lib/auth/routes';
import { redirect } from 'next/navigation';
import type { PlatformLayoutProps } from '@/types';
export type { PlatformLayoutProps };

export default async function PlatformLayout({ children }: PlatformLayoutProps) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN') {
    redirect(SHOP_HOME);
  }
  return children;
}
